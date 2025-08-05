"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";
import { breakdownSchema, ratelimit } from "@/lib/validation";
import { consolePino } from "@/lib/logger";

export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Rate limiting
    const headersList = await nextHeaders();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

    // Only apply rate limiting in production
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

    // Handle photo upload if present
    let photoPath: string | null = null;
    const photo = formData.get("photo") as File | null;

    consolePino.info("Photo received:", photo);
    if (photo) {
      consolePino.info("Photo size:", photo.size);
      consolePino.info("Photo type:", photo.type);
    }

    if (photo && photo.size > 0) {
      try {
        consolePino.info("Processing photo upload...");
        // Validate file type
        if (!photo.type.startsWith("image/")) {
          consolePino.info("Invalid file type detected:", photo.type);

          return {
            success: false,
            message: "Invalid file type. Please upload an image.",
          };
        }

        // Validate file size (3MB limit)
        if (photo.size > 3 * 1024 * 1024) {
          consolePino.info("File size exceeds limit:", photo.size);

          return { success: false, message: "File size exceeds 3MB limit." };
        }

        // Convert file to buffer for sharp processing
        consolePino.info("Converting file to buffer...");
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        consolePino.info("Buffer size:", buffer.length);

        // Generate unique filename
        const fileId = randomUUID();
        const fileExtension = photo.type.split("/")[1] || "jpg";
        const filename = `breakdown-${fileId}.${fileExtension}`;

        consolePino.info("Generated filename:", filename);

        // Compress image using Sharp to target 0.5-1MB
        consolePino.info("Compressing image...");
        const compressedBuffer = await sharp(buffer)
          .resize({
            width: 1024,
            height: 1024,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        consolePino.info("Compressed buffer size:", compressedBuffer.length);

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "userwo");
        const fullPath = join(uploadDir, filename);

        consolePino.info("Upload directory:", uploadDir);
        consolePino.info("Full path:", fullPath);

        // Create directory if it doesn't exist
        try {
          await mkdir(uploadDir, { recursive: true });
          consolePino.info("Upload directory created or already exists");
        } catch (error) {
          consolePino.error("Error creating upload directory:", error);
          // Continue anyway as writeFile might still work
        }

        // Save compressed image
        consolePino.info("Saving compressed image...");
        await writeFile(fullPath, compressedBuffer);
        consolePino.info("Image saved successfully");

        // Store relative path for database storage
        photoPath = `/uploads/userwo/${filename}`;
        consolePino.info("Photo path set to:", photoPath);
      } catch (error) {
        consolePino.error("Error processing photo:", error);

        return { success: false, message: "Failed to process photo upload." };
      }
    } else {
      consolePino.info("No photo to process");
    }

    const unitExists = await prisma.unit.findUnique({ where: { id: unitId } });

    consolePino.info("Unit ID from form:", unitId);
    consolePino.info("Unit exists in DB:", unitExists);
    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    const reporterExists = await prisma.user.findUnique({
      where: { id: reportedById },
    });

    consolePino.info("Reporter ID from form:", reportedById);
    consolePino.info("Reporter exists in DB:", reporterExists);
    if (!reporterExists) {
      return { success: false, message: "Reporter user not found!" };
    }

    const newBreakdownNumber = await prisma.$transaction(async (tx) => {
      const last = await tx.breakdown.findFirst({
        orderBy: { breakdownNumber: "desc" },
      });

      let nextNumber = 1;

      if (last?.breakdownNumber) {
        const match = last.breakdownNumber.match(/\d+$/);

        if (match) {
          nextNumber = parseInt(match[0], 10) + 1;
        }
      }

      return `WO-${nextNumber.toString().padStart(4, "0")}`;
    });

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
        photo: photoPath,
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

    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `Breakdown reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) by ${newBreakdown.reportedBy.name}`,
        unitId,
      },
    });

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
      return {
        success: false,
        message: "Invalid unit or user reference!",
      };
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
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    consolePino.error("Error fetching users:", error);

    return [];
  }
}
