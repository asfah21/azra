"use server";

import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";
import sharp from "sharp";
import { getServerSession } from "next-auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { authOptions } from "@/lib/auth"; // sesuaikan path kamu
import { prisma } from "@/lib/prisma";
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

/* =========================================================================
   Util kompresi: target <= 300 KB (adaptif)
   - Rotate sesuai EXIF
   - WebP jika ada alpha, selain itu JPEG (mozjpeg + 4:2:0, progressive)
   - Turunkan quality; jika masih besar, turunkan width
   - Batas bawah: quality 40, width 640
   ========================================================================= */
type Encoded = { buffer: Buffer; contentType: "image/jpeg" | "image/webp" };

async function compressImageToUnder(
  input: Buffer,
  targetBytes = 300 * 1024,
): Promise<Encoded> {
  const meta = await sharp(input).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);

  let width = Math.min(1280, meta.width ?? 1280);
  const minWidth = 640;

  let best: Encoded | null = null;

  const encodeOnce = async (w: number, q: number): Promise<Encoded> => {
    if (hasAlpha) {
      const buf = await sharp(input)
        .rotate()
        .resize({
          width: w,
          height: w,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: q,
          alphaQuality: 80,
          effort: 4,
        })
        .toBuffer();

      return { buffer: buf, contentType: "image/webp" };
    } else {
      const buf = await sharp(input)
        .rotate()
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
    for (let q = 82; q >= 40; q -= 8) {
      const out = await encodeOnce(width, q);

      if (!best || out.buffer.length < best.buffer.length) best = out;
      if (out.buffer.length <= targetBytes) return out;
    }
    if (width <= minWidth) break;
    width = Math.max(minWidth, Math.floor(width * 0.85));
  }

  return best!;
}

/** ======================== CREATE ======================== */
export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Required fields
    const breakdownNumber = formData.get("breakdownNumber") as string;
    const description = formData.get("description") as string;
    const breakdownTime = formData.get("breakdownTime") as string;
    const workingHours = parseFloat(formData.get("workingHours") as string);
    const unitId = formData.get("unitId") as string;
    const reportedById = formData.get("reportedById") as string;
    const priority = formData.get("priority") as string;
    const shift = formData.get("shift") as string;

    // Get components from form data
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

    // Handle photo upload (≤ 3MB raw) → kompres ≤ 300 KB → MinIO
    let photoPath: string | null = null;
    const photo = formData.get("photo") as File | null;

    if (photo && photo.size > 0) {
      try {
        if (!photo.type.startsWith("image/")) {
          return {
            success: false,
            message: "Invalid file type. Please upload an image.",
          };
        }
        if (photo.size > 1 * 1024 * 1024) {
          return { success: false, message: "File size exceeds 1MB limit." };
        }

        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { buffer: compressedBuffer, contentType } =
          await compressImageToUnder(buffer, 300 * 1024);

        // Generate unique filename + ext sesuai encoding
        const fileId = randomUUID();
        const ext = contentType === "image/webp" ? "webp" : "jpg";
        const filename = `breakdown-${fileId}.${ext}`;

        // Key rapi per fitur workorders
        const objectKey = `workorders/${filename}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.MINIO_BUCKET!,
            Key: objectKey,
            Body: compressedBuffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        );

        photoPath = publicUrlFor(objectKey);
      } catch (error) {
        consolePino.error("Error processing photo:", error);

        return { success: false, message: "Failed to process photo upload." };
      }
    }

    // Validation
    if (
      !description ||
      !breakdownTime ||
      isNaN(workingHours) ||
      !unitId ||
      !reportedById ||
      !priority ||
      !shift
    ) {
      return { success: false, message: "All required fields must be filled!" };
    }

    if (components.length === 0) {
      return {
        success: false,
        message: "At least one component must be added!",
      };
    }

    const validPriorities = ["low", "medium", "high"];

    if (!validPriorities.includes(priority)) {
      return { success: false, message: "Invalid priority value!" };
    }

    const validShifts = ["siang", "malam"];

    if (!validShifts.includes(shift)) {
      return { success: false, message: "Invalid shift value!" };
    }

    // Check if unit exists
    const unitExists = await prisma.unit.findUnique({ where: { id: unitId } });

    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    // Check if reporter exists
    const reporterExists = await prisma.user.findUnique({
      where: { id: reportedById },
    });

    if (!reporterExists) {
      return { success: false, message: "Reporter user not found!" };
    }

    // Get user role untuk menentukan prefix
    const user = await prisma.user.findUnique({
      where: { id: reportedById },
      select: { role: true },
    });

    const prefix =
      user?.role === "super_admin" || user?.role === "admin_elec"
        ? "WOIT-"
        : "WO-";

    const newBreakdownNumber = await prisma.$transaction(async (tx) => {
      // cari nomor terakhir dengan prefix yang sesuai
      const last = await tx.breakdown.findFirst({
        where: { breakdownNumber: { startsWith: prefix } },
        orderBy: { breakdownNumber: "desc" },
      });

      let nextNumber = 1;

      if (last?.breakdownNumber) {
        const match = last.breakdownNumber.match(/\d+$/);

        if (match) nextNumber = parseInt(match[0], 10) + 1;
      }

      return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    });

    // Create the breakdown
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
      },
    });

    // Create history log
    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `WO reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag})`,
        unitId,
      },
    });

    revalidatePath("/dashboard/workorders");

    return {
      success: true,
      message: `WO for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) reported successfully!`,
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
      message: "Failed to report workorder. Please try again.",
    };
  }
}

export async function updateBreakdownStatus(
  id: string,
  status: BreakdownStatus,
  resolvedById?: string,
) {
  try {
    const updateData: any = { status };

    // Jika status berubah menjadi in_progress dan ada user ID
    if (status === "in_progress" && resolvedById) {
      updateData.inProgressById = resolvedById;
      updateData.inProgressAt = new Date();
    }

    const updatedBreakdown = await prisma.breakdown.update({
      where: { id },
      data: updateData,
      include: {
        unit: true,
        inProgressBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Jika status adalah RFU dan ada resolvedById, buat RFUReport
    if (status === "rfu" && resolvedById) {
      await prisma.rFUReport.create({
        data: {
          solution: "Marked as RFU by user",
          breakdownId: id,
          resolvedById: resolvedById,
        },
      });
    }

    await prisma.unitHistory.create({
      data: {
        logType: "status_update",
        referenceId: updatedBreakdown.id,
        message: `Status for workorder ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status} by ${updatedBreakdown.inProgressBy?.name || "unknown user"}.`,
        unitId: updatedBreakdown.unitId,
      },
    });

    revalidatePath("/dashboard/workorders");

    return { success: true, message: "Breakdown status updated." };
  } catch (error) {
    consolePino.error("Error updating breakdown status:", error);

    return { success: false, message: "Failed to update status." };
  }
}

export async function updateBreakdownStatusWithActions(
  id: string,
  status: BreakdownStatus,
  solution: string,
  actions: Array<{ action: string; description: string }>,
  resolvedById?: string,
) {
  //Tambahan Backend agar hanya super_admin, admin_heavy, pengawas, dan mekanik yang dapat mengubah status breakdown
  const session = await getServerSession(authOptions);
  const allowedRoles = ["super_admin", "admin_heavy", "pengawas", "mekanik"];

  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, message: "Unauthorized access." };
  }

  try {
    const updatedBreakdown = await prisma.breakdown.update({
      where: { id },
      data: { status },
      include: { unit: true },
    });

    // Jika status adalah RFU dan ada resolvedById, buat RFUReport dengan actions
    if (status === "rfu" && resolvedById) {
      const rfuReport = await prisma.rFUReport.create({
        data: {
          solution: solution,
          breakdownId: id,
          resolvedById: resolvedById,
        },
      });

      // Buat actions untuk RFU report
      if (actions.length > 0) {
        await prisma.rFUReportAction.createMany({
          data: actions.map((action) => ({
            action: action.action,
            description: action.description || null,
            rfuReportId: rfuReport.id,
          })),
        });
      }
    }

    await prisma.unitHistory.create({
      data: {
        logType: "status_update",
        referenceId: updatedBreakdown.id,
        message: `Status for workorder ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status.toUpperCase()} with ${actions.length} actions.`,
        // message: `Status for workorder ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status} with ${actions.length} actions.`,
        unitId: updatedBreakdown.unitId,
      },
    });

    revalidatePath("/dashboard/workorders");

    return { success: true, message: "Breakdown status updated with actions." };
  } catch (error) {
    consolePino.error("Error updating breakdown status with actions:", error);

    return { success: false, message: "Failed to update status with actions." };
  }
}

export async function updateBreakdownStatusWithUnitStatus(
  id: string,
  status: BreakdownStatus,
  unitStatus: string,
  priority?: string,
  notes?: string,
  resolvedById?: string,
) {
  //Tambahan Backend agar hanya super_admin, admin_heavy, pengawas, dan mekanik yang dapat mengubah status breakdown
  const session = await getServerSession(authOptions);
  const allowedRoles = ["super_admin", "admin_heavy", "pengawas", "mekanik"];

  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return { success: false, message: "Unauthorized access." };
  }

  try {
    const breakdown = await prisma.breakdown.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!breakdown) {
      return { success: false, message: "Breakdown not found!" };
    }

    // Update breakdown status dan unit status dalam satu transaction
    await prisma.$transaction(async (tx) => {
      // Update breakdown status
      const updateData: any = { status };

      // Update priority if provided
      if (priority) {
        updateData.priority = priority;
      }

      if (status === "in_progress" && resolvedById) {
        updateData.inProgressById = resolvedById;
        updateData.inProgressAt = new Date();
      }

      await tx.breakdown.update({
        where: { id },
        data: updateData,
      });

      // Update unit status
      await tx.unit.update({
        where: { id: breakdown.unitId },
        data: { status: unitStatus },
      });

      // Create history log untuk breakdown
      await tx.unitHistory.create({
        data: {
          logType: "status_update",
          referenceId: breakdown.id,
          message: `Workorder ${breakdown.breakdownNumber} marked as in progress. Unit status updated to ${unitStatus}.${notes ? ` Notes: ${notes}` : ""}`,
          unitId: breakdown.unitId,
        },
      });

      // Create history log untuk unit status change
      await tx.unitHistory.create({
        data: {
          logType: "unit_status_change",
          referenceId: breakdown.id,
          message: `Unit status changed to ${unitStatus} due to workorder ${breakdown.breakdownNumber}.${notes ? ` Notes: ${notes}` : ""}`,
          unitId: breakdown.unitId,
        },
      });
    });

    revalidatePath("/dashboard/workorders");

    return {
      success: true,
      message: `Breakdown marked as in progress and unit status updated to ${unitStatus}.`,
    };
  } catch (error) {
    consolePino.error(
      "Error updating breakdown status with unit status:",
      error,
    );

    return { success: false, message: "Failed to update status." };
  }
}

export async function deleteBreakdown(id: string) {
  try {
    const breakdownToDelete = await prisma.breakdown.findUnique({
      where: { id },
      select: {
        unitId: true,
        breakdownNumber: true,
        unit: {
          select: {
            name: true,
            assetTag: true,
          },
        },
      },
    });

    if (!breakdownToDelete) {
      return { success: false, message: "Breakdown not found!" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Hapus RFUReportAction terlebih dahulu
      await tx.rFUReportAction.deleteMany({
        where: {
          rfuReport: {
            breakdownId: id,
          },
        },
      });

      // 2. Baru hapus RFUReport
      await tx.rFUReport.deleteMany({
        where: { breakdownId: id },
      });

      // 3. Hapus BreakdownComponent
      await tx.breakdownComponent.deleteMany({
        where: { breakdownId: id },
      });

      // 4. Terakhir hapus Breakdown
      await tx.breakdown.delete({
        where: { id },
      });
    });

    // Create history log setelah transaction berhasil
    await prisma.unitHistory.create({
      data: {
        logType: "breakdown_deleted",
        referenceId: id,
        message: `Breakdown report ${breakdownToDelete.breakdownNumber} for ${breakdownToDelete.unit.name} deleted.`,
        unitId: breakdownToDelete.unitId,
      },
    });

    revalidatePath("/dashboard/workorders");

    return { success: true, message: "Breakdown deleted successfully!" };
  } catch (error) {
    consolePino.error("Error deleting breakdown:", error);

    return { success: false, message: "Failed to delete breakdown." };
  }
}
