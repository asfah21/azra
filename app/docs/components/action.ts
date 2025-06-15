"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// Get all units with related data
export async function getUnits() {
  try {
    const units = await prisma.unit.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return units;
  } catch (error) {
    console.error("Error fetching units:", error);
    throw new Error("Gagal mengambil data unit");
  }
}

// Get unit by ID
export async function getUnitById(id: string) {
  try {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!unit) {
      throw new Error("Unit tidak ditemukan");
    }

    return unit;
  } catch (error) {
    console.error("Error fetching unit:", error);
    throw new Error("Gagal mengambil data unit");
  }
}

// Delete unit
export async function deleteUnit(id: string) {
  try {
    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return { success: false, message: "Unit tidak ditemukan" };
    }

    await prisma.unit.delete({
      where: { id },
    });

    revalidatePath("/units");

    return {
      success: true,
      message: `Unit ${existingUnit.name} berhasil dihapus`,
    };
  } catch (error) {
    console.error("Error deleting unit:", error);

    return { success: false, message: "Gagal menghapus unit" };
  }
}

// Update unit
export async function updateUnit(
  id: string,
  prevState: any,
  formData: FormData,
) {
  try {
    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return { success: false, message: "Unit tidak ditemukan" };
    }

    // Extract form data
    const assetTag = formData.get("assetTag") as string;
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const categoryId = Number(formData.get("categoryId"));

    // Optional fields
    const description = (formData.get("description") as string) || null;
    const status = (formData.get("status") as string) || "operational";
    const condition = (formData.get("condition") as string) || null;
    const serialNumber = (formData.get("serialNumber") as string) || null;
    const department = (formData.get("department") as string) || null;
    const manufacturer = (formData.get("manufacturer") as string) || null;
    const assignedToId = (formData.get("assignedToId") as string) || null;

    // Date fields
    const installDate = formData.get("installDate") as string;
    const warrantyExpiry = formData.get("warrantyExpiry") as string;
    const lastMaintenance = formData.get("lastMaintenance") as string;
    const nextMaintenance = formData.get("nextMaintenance") as string;

    // Numeric fields
    const assetValue = formData.get("assetValue") as string;
    const utilizationRate = formData.get("utilizationRate") as string;

    // Validation
    if (!assetTag || !name || !location || !categoryId) {
      return { success: false, message: "Field wajib harus diisi!" };
    }

    // Check if assetTag already exists (except for current unit)
    if (assetTag !== existingUnit.assetTag) {
      const duplicateUnit = await prisma.unit.findUnique({
        where: { assetTag },
      });

      if (duplicateUnit) {
        return { success: false, message: "Asset Tag sudah digunakan!" };
      }
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return { success: false, message: "Category tidak ditemukan!" };
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

    const updatedUnit = await prisma.unit.update({
      where: { id },
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
        assignedToId: assignedToId || null,
      },
    });

    revalidatePath("/units");

    return {
      success: true,
      message: `Unit ${updatedUnit.name} berhasil diperbarui!`,
    };
  } catch (error: unknown) {
    console.error("Error updating unit:", error);

    if (error instanceof Error) {
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
      message: "Gagal memperbarui unit. Silakan coba lagi.",
    };
  }
}

// Get categories for dropdown
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Gagal mengambil data kategori");
  }
}

// Get users for assignment dropdown
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
    throw new Error("Gagal mengambil data user");
  }
}
