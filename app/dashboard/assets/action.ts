"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createUnit(prevState: any, formData: FormData) {
  try {
    // Required fields
    const assetTag = formData.get("assetTag") as string;
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const categoryId = Number(formData.get("categoryId"));
    const createdById = formData.get("createdById") as string;

    // Optional fields
    const description = (formData.get("description") as string) || null;
    const status = (formData.get("status") as string) || "operational";
    const condition = (formData.get("condition") as string) || null;
    const serialNumber = (formData.get("serialNumber") as string) || null;
    const department = (formData.get("department") as string) || null;
    const manufacturer = (formData.get("manufacturer") as string) || null;
    const assignedToId = (formData.get("assignedToId") as string) || null;

    // Date fields - convert empty strings to null
    const installDate = formData.get("installDate") as string;
    const warrantyExpiry = formData.get("warrantyExpiry") as string;
    const lastMaintenance = formData.get("lastMaintenance") as string;
    const nextMaintenance = formData.get("nextMaintenance") as string;

    // Numeric fields
    const assetValue = formData.get("assetValue") as string;
    const utilizationRate = formData.get("utilizationRate") as string;

    // Validation
    if (!assetTag || !name || !location || !categoryId || !createdById) {
      return { success: false, message: "Field wajib harus diisi!" };
    }

    // Check if assetTag already exists
    const existingUnit = await prisma.unit.findUnique({
      where: { assetTag },
    });

    if (existingUnit) {
      return { success: false, message: "Asset Tag sudah digunakan!" };
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return { success: false, message: "Category tidak ditemukan!" };
    }

    // Check if createdById user exists
    const userExists = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!userExists) {
      return { success: false, message: "User pembuat tidak ditemukan!" };
    }

    // Check if assignedToId user exists (if provided)
    if (assignedToId) {
      const assignedUserExists = await prisma.user.findUnique({
        where: { id: assignedToId },
      });

      if (!assignedUserExists) {
        return {
          success: false,
          message: "User yang ditugaskan tidak ditemukan!",
        };
      }
    }

    const newUnit = await prisma.unit.create({
      data: {
        assetTag,
        name,
        description,
        categoryId,
        status,
        condition,
        serialNumber,
        location,
        department,
        manufacturer,
        installDate: installDate ? new Date(installDate) : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
        assetValue: assetValue ? parseFloat(assetValue) : null,
        utilizationRate: utilizationRate ? parseInt(utilizationRate) : null,
        createdById,
        assignedToId: assignedToId || null,
      },
    });

    revalidatePath("/units"); // revalidate list page
    revalidatePath("/docs"); // revalidate current page

    return {
      success: true,
      message: `Unit ${newUnit.name} berhasil ditambahkan dengan Asset Tag: ${newUnit.assetTag}!`,
    };
  } catch (error: unknown) {
    console.error("Error creating unit:", error);

    // Type guard to check if error is an object with a code property
    if (error instanceof Error) {
      // Handle specific Prisma errors
      if ("code" in error && error.code === "P2002") {
        return { success: false, message: "Asset Tag sudah digunakan!" };
      }

      if ("code" in error && error.code === "P2003") {
        return {
          success: false,
          message: "Referensi kategori atau user tidak valid!",
        };
      }
    }

    return {
      success: false,
      message: "Gagal menambahkan unit. Silakan coba lagi.",
    };
  }
}
