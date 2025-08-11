"use server";

import { randomUUID } from "crypto";

import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { breakdownSchema, ratelimit } from "@/lib/validation";
import { consolePino } from "@/lib/logger";

/** ==== MinIO (S3) client ==== */
const s3 = new S3Client({
  region: "us-east-1",
  endpoint: `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true, // wajib untuk MinIO
});

function publicUrlFor(key: string) {
  const base =
    process.env.MINIO_PUBLIC_BASEURL ||
    `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;

  return `${base.replace(/\/+$/, "")}/${process.env.MINIO_BUCKET}/${encodeURI(key)}`;
}

/** =========================================================================
 *  Util kompresi: target <= 300 KB (adaptif)
 *  - Pilih WebP jika ada alpha; selain itu pakai JPEG (mozjpeg + 4:2:0)
 *  - Turunkan quality bertahap, kalau belum cukup kecil turunkan width
 * ========================================================================= */
type Encoded = { buffer: Buffer; contentType: "image/jpeg" | "image/webp" };

async function compressImageToUnder(
  input: Buffer,
  targetBytes = 300 * 1024,
): Promise<Encoded> {
  const meta = await sharp(input).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);
  let width = Math.min(1280, meta.width ?? 1280);
  let quality = 82;

  const minWidth = 640; // turunkan jika ingin lebih “paksa” ke ukuran kecil
  const minQuality = 40; // turunkan ke 35 bila benar-benar perlu

  let best: Encoded | null = null;

  const encodeOnce = async (w: number, q: number): Promise<Encoded> => {
    if (hasAlpha) {
      const buf = await sharp(input)
        .resize({
          width: w,
          height: w,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: q,
          alphaQuality: 80,
          effort: 4, // kompresi lebih optimal tanpa terlalu lambat
        })
        .toBuffer();

      return { buffer: buf, contentType: "image/webp" };
    } else {
      const buf = await sharp(input)
        .resize({
          width: w,
          height: w,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: q,
          mozjpeg: true,
          chromaSubsampling: "4:2:0",
          progressive: true,
        })
        .toBuffer();

      return { buffer: buf, contentType: "image/jpeg" };
    }
  };

  while (true) {
    // coba turunkan quality pada lebar saat ini
    for (let q = quality; q >= minQuality; q -= 8) {
      const out = await encodeOnce(width, q);

      if (!best || out.buffer.length < best.buffer.length) best = out;
      if (out.buffer.length <= targetBytes) return out;
    }
    // jika belum tembus, kecilkan lebar dan ulangi
    if (width <= minWidth) break;
    width = Math.max(minWidth, Math.floor(width * 0.85));
  }

  // fallback: kembalikan kandidat terkecil yang didapat
  return best!;
}

/** ==== Server Action ==== */
export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Rate limiting
    const headersList = await nextHeaders();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

    if (process.env.NODE_ENV === "production") {
      const { success: limitReached } = await ratelimit.limit(ip);

      if (!limitReached) {
        return {
          success: false,
          message: "Too many requests. Please try again later.",
        };
      }
    }

    // Convert form data to object
    const formDataObj: Record<string, any> = {};

    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });

    // Parse components array
    const components: Array<{ component: string; subcomponent: string }> = [];
    let index = 0;

    while (formData.get(`components[${index}][component]`)) {
      components.push({
        component: formData.get(`components[${index}][component]`) as string,
        subcomponent: formData.get(
          `components[${index}][subcomponent]`,
        ) as string,
      });
      index++;
    }

    // Prepare data for validation
    const data = {
      ...formDataObj,
      workingHours: parseFloat(formDataObj.workingHours || "0"),
      components,
    };

    // Validate with Zod
    const validationResult = await breakdownSchema.safeParseAsync(data);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );

      return {
        success: false,
        message: `Validation failed: ${errorMessages.join("; ")}`,
      };
    }

    // Extract validated data
    const {
      description,
      breakdownTime,
      workingHours,
      unitId,
      reportedById,
      priority,
      shift,
    } = validationResult.data;

    // Handle photo upload (input user maks 3MB) → kompres ke <= 300 KB → MinIO
    let photoPath: string | null = null;
    const photo = formData.get("photo") as File | null;

    consolePino.info(
      "Photo received:",
      photo
        ? { size: photo.size, type: photo.type, name: (photo as any).name }
        : null,
    );

    if (photo && photo.size > 0) {
      try {
        if (!photo.type.startsWith("image/")) {
          consolePino.info("Invalid file type:", photo.type);

          return {
            success: false,
            message: "Invalid file type. Please upload an image.",
          };
        }

        // Validasi input user maks 3 MB (ingat: proxy/Next body limit harus > 3MB)
        if (photo.size > 3 * 1024 * 1024) {
          consolePino.info("File too large (raw):", photo.size);

          return { success: false, message: "File size exceeds 3MB limit." };
        }

        // Convert file ke buffer
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        consolePino.info("Original buffer size:", buffer.length);

        // Kompres adaptif sampai <= 300 KB
        const { buffer: compressedBuffer, contentType } =
          await compressImageToUnder(buffer, 300 * 1024);

        consolePino.info(
          "Compressed buffer size:",
          compressedBuffer.length,
          "type:",
          contentType,
        );

        // Generate key & ext
        const fileId = randomUUID();
        const ext = contentType === "image/webp" ? "webp" : "jpg";
        const filename = `breakdown-${fileId}.${ext}`;

        // Object key di MinIO (rapi per folder use-case)
        const objectKey = `userwo/${filename}`;

        // Upload ke MinIO
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.MINIO_BUCKET!,
            Key: objectKey,
            Body: compressedBuffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );

        // URL publik untuk disimpan di DB
        photoPath = publicUrlFor(objectKey);
        consolePino.info("Photo uploaded to MinIO:", photoPath);
      } catch (error) {
        consolePino.error("Error processing photo:", error);

        return { success: false, message: "Failed to process photo upload." };
      }
    } else {
      consolePino.info("No photo to process");
    }

    // Validasi referensi unit & user
    const unitExists = await prisma.unit.findUnique({ where: { id: unitId } });

    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    const reporterExists = await prisma.user.findUnique({
      where: { id: reportedById },
    });

    if (!reporterExists) {
      return { success: false, message: "Reporter user not found!" };
    }

    // Generate nomor breakdown berurutan (WO-0001, dst.)
    const newBreakdownNumber = await prisma.$transaction(async (tx) => {
      const last = await tx.breakdown.findFirst({
        orderBy: { breakdownNumber: "desc" },
      });
      let nextNumber = 1;

      if (last?.breakdownNumber) {
        const match = last.breakdownNumber.match(/\d+$/);

        if (match) nextNumber = parseInt(match[0], 10) + 1;
      }

      return `WO-${nextNumber.toString().padStart(4, "0")}`;
    });

    // Create breakdown
    const newBreakdown = await prisma.breakdown.create({
      data: {
        breakdownNumber: newBreakdownNumber,
        description,
        breakdownTime: new Date(breakdownTime),
        workingHours,
        priority,
        shift,
        status: BreakdownStatus.pending,
        unitId,
        reportedById,
        photo: photoPath, // URL publik MinIO (atau null)
        components: {
          create: components.map((comp) => ({
            component: comp.component,
            subcomponent: comp.subcomponent,
          })),
        },
      },
      include: {
        components: true,
        unit: true,
        reportedBy: true,
      },
    });

    // Log unit history
    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `Breakdown reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) by ${newBreakdown.reportedBy.name}`,
        unitId,
      },
    });

    // Revalidate halaman terkait
    revalidatePath("/userwo");

    return {
      success: true,
      message: `Breakdown for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) reported successfully!`,
    };
  } catch (error: unknown) {
    consolePino.error("Error creating breakdown:", error);
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2003"
    ) {
      return { success: false, message: "Invalid unit or user reference!" };
    }

    return {
      success: false,
      message: "Failed to report breakdown. Please try again.",
    };
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    consolePino.error("Error fetching users:", error);

    return [];
  }
}
