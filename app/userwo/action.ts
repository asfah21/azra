"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";
import sharp from "sharp";

import { prisma } from "@/lib/prisma";

export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Debug: Log all form data
    console.log("=== Form Data Received ===");
    const formDataObj: Record<string, any> = {};

    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    console.log(formDataObj);
    console.log("========================");

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

    // Handle photo upload if present
    let photoPath: string | null = null;
    const photo = formData.get("photo") as File | null;

    console.log("Photo received:", photo);
    if (photo) {
      console.log("Photo size:", photo.size);
      console.log("Photo type:", photo.type);
    }

    if (photo && photo.size > 0) {
      try {
        console.log("Processing photo upload...");
        // Validate file type
        if (!photo.type.startsWith("image/")) {
          console.log("Invalid file type detected:", photo.type);

          return {
            success: false,
            message: "Invalid file type. Please upload an image.",
          };
        }

        // Validate file size (3MB limit)
        if (photo.size > 3 * 1024 * 1024) {
          console.log("File size exceeds limit:", photo.size);

          return { success: false, message: "File size exceeds 3MB limit." };
        }

        // Convert file to buffer for sharp processing
        console.log("Converting file to buffer...");
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log("Buffer size:", buffer.length);

        // Generate unique filename
        const fileId = randomUUID();
        const fileExtension = photo.type.split("/")[1] || "jpg";
        const filename = `breakdown-${fileId}.${fileExtension}`;

        console.log("Generated filename:", filename);

        // Compress image using Sharp to target 0.5-1MB
        console.log("Compressing image...");
        const compressedBuffer = await sharp(buffer)
          .resize({
            width: 1024,
            height: 1024,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        console.log("Compressed buffer size:", compressedBuffer.length);

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), "public", "uploads", "userwo");
        const fullPath = join(uploadDir, filename);

        console.log("Upload directory:", uploadDir);
        console.log("Full path:", fullPath);

        // Create directory if it doesn't exist
        try {
          await mkdir(uploadDir, { recursive: true });
          console.log("Upload directory created or already exists");
        } catch (error) {
          console.error("Error creating upload directory:", error);
          // Continue anyway as writeFile might still work
        }

        // Save compressed image
        console.log("Saving compressed image...");
        await writeFile(fullPath, compressedBuffer);
        console.log("Image saved successfully");

        // Store relative path for database storage
        photoPath = `/uploads/userwo/${filename}`;
        console.log("Photo path set to:", photoPath);
      } catch (error) {
        console.error("Error processing photo:", error);

        return { success: false, message: "Failed to process photo upload." };
      }
    } else {
      console.log("No photo to process");
    }

    const unitExists = await prisma.unit.findUnique({ where: { id: unitId } });

    console.log("Unit ID from form:", unitId);
    console.log("Unit exists in DB:", unitExists);
    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    const reporterExists = await prisma.user.findUnique({
      where: { id: reportedById },
    });

    console.log("Reporter ID from form:", reportedById);
    console.log("Reporter exists in DB:", reporterExists);
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
    console.error("Error creating breakdown:", error);

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
    console.error("Error fetching users:", error);

    return [];
  }
}
