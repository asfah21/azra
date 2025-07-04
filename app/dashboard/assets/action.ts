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

export async function updateAsset(prevState: any, formData: FormData) {
  try {
    // Required fields
    const id = formData.get("id") as string;
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

    // Date fields - convert empty strings to null
    const installDate = formData.get("installDate") as string;
    const warrantyExpiry = formData.get("warrantyExpiry") as string;
    const lastMaintenance = formData.get("lastMaintenance") as string;
    const nextMaintenance = formData.get("nextMaintenance") as string;

    // Numeric fields
    const assetValue = formData.get("assetValue") as string;
    const utilizationRate = formData.get("utilizationRate") as string;

    // Validation
    if (!id || !assetTag || !name || !location || !categoryId) {
      return { success: false, message: "Field wajib harus diisi!" };
    }

    // Check if asset exists
    const existingAsset = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      return { success: false, message: "Asset tidak ditemukan!" };
    }

    // Check if assetTag already exists (excluding current asset)
    const duplicateAssetTag = await prisma.unit.findFirst({
      where: {
        assetTag,
        id: { not: id },
      },
    });

    if (duplicateAssetTag) {
      return { success: false, message: "Asset Tag sudah digunakan!" };
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

    const updatedAsset = await prisma.unit.update({
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

    revalidatePath("/dashboard/assets"); // revalidate assets page

    return {
      success: true,
      message: `Asset ${updatedAsset.name} berhasil diperbarui!`,
    };
  } catch (error: unknown) {
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

      if ("code" in error && error.code === "P2025") {
        return {
          success: false,
          message: "Asset tidak ditemukan!",
        };
      }
    }

    return {
      success: false,
      message: "Gagal memperbarui asset. Silakan coba lagi.",
    };
  }
}

export async function importAssetsFromExcel(
  prevState: any,
  formData: FormData,
) {
  try {
    const excelDataJson = formData.get("excelData") as string;
    const createdById = formData.get("createdById") as string;

    if (!excelDataJson || !createdById) {
      return {
        success: false,
        message: "Data Excel atau User ID tidak ditemukan!",
      };
    }

    const excelData = JSON.parse(excelDataJson) as any[];

    if (!Array.isArray(excelData) || excelData.length === 0) {
      return {
        success: false,
        message: "Data Excel kosong atau format tidak valid!",
      };
    }

    // Validasi user exists
    const userExists = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!userExists) {
      return { success: false, message: "User pembuat tidak ditemukan!" };
    }

    // Buat map untuk users berdasarkan nama
    const users = await prisma.user.findMany();
    const usersMap = new Map(
      users.map((user) => [user.name.toLowerCase(), user.id]),
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each row
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      try {
        // Validate required fields
        if (
          !row.assetTag?.trim() ||
          !row.name?.trim() ||
          !row.location?.trim()
        ) {
          errors.push(`Baris ${i + 1}: Field wajib tidak boleh kosong`);
          errorCount++;
          continue;
        }

        // Check if assetTag already exists
        const existingUnit = await prisma.unit.findUnique({
          where: { assetTag: row.assetTag.trim() },
        });

        if (existingUnit) {
          errors.push(
            `Baris ${i + 1}: Asset Tag "${row.assetTag}" sudah digunakan`,
          );
          errorCount++;
          continue;
        }

        // Validate category
        if (!row.categoryId || ![1, 2].includes(Number(row.categoryId))) {
          errors.push(`Baris ${i + 1}: Category ID harus 1 atau 2`);
          errorCount++;
          continue;
        }

        // Validate status
        const status = row.status?.toLowerCase() || "operational";
        const validStatuses = [
          "operational",
          "maintenance",
          "repair",
          "decommissioned",
        ];

        if (!validStatuses.includes(status)) {
          errors.push(`Baris ${i + 1}: Status tidak valid`);
          errorCount++;
          continue;
        }

        // Validate condition
        let condition = null;

        if (row.condition) {
          const conditionLower = row.condition.toLowerCase();
          const validConditions = ["excellent", "good", "fair", "poor"];

          if (validConditions.includes(conditionLower)) {
            condition = conditionLower;
          }
        }

        // Find assignedToId by name
        let assignedToId = null;

        if (row.assignedToId) {
          const userId = usersMap.get(row.assignedToId.toLowerCase());

          if (userId) {
            assignedToId = userId;
          }
        }

        // Parse dates
        const parseDate = (dateStr: string) => {
          if (!dateStr) return null;
          const date = new Date(dateStr);

          return isNaN(date.getTime()) ? null : date;
        };

        // Parse numeric values
        const parseNumber = (value: any) => {
          if (!value) return null;
          const num = Number(value);

          return isNaN(num) ? null : num;
        };

        // Create unit
        await prisma.unit.create({
          data: {
            assetTag: row.assetTag.trim(),
            name: row.name.trim(),
            description: row.description?.trim() || null,
            categoryId: Number(row.categoryId),
            status,
            condition,
            serialNumber: row.serialNumber?.trim() || null,
            location: row.location.trim(),
            department: row.department?.trim() || null,
            manufacturer: row.manufacturer?.trim() || null,
            installDate: parseDate(row.installDate),
            warrantyExpiry: parseDate(row.warrantyExpiry),
            lastMaintenance: parseDate(row.lastMaintenance),
            nextMaintenance: parseDate(row.nextMaintenance),
            assetValue: parseNumber(row.assetValue),
            utilizationRate: parseNumber(row.utilizationRate),
            createdById,
            assignedToId,
          },
        });

        successCount++;
      } catch (error) {
        errors.push(`Baris ${i + 1}: Gagal memproses data`);
        errorCount++;
      }
    }

    revalidatePath("/dashboard/assets");

    if (successCount === 0) {
      return {
        success: false,
        message: `Gagal mengimpor semua data. ${errors.slice(0, 5).join("; ")}${errors.length > 5 ? "..." : ""}`,
      };
    }

    if (errorCount > 0) {
      return {
        success: true,
        message: `Berhasil mengimpor ${successCount} asset, ${errorCount} gagal. ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""}`,
      };
    }

    return {
      success: true,
      message: `Berhasil mengimpor ${successCount} asset!`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: "Gagal mengimpor assets. Silakan coba lagi.",
    };
  }
}

export async function deleteAsset(id: string, userRole: string) {
  try {
    // Validasi role - hanya super_admin yang bisa delete
    if (userRole !== "super_admin") {
      return {
        success: false,
        message: "Unauthorized: Hanya Super Admin yang dapat menghapus asset.",
      };
    }

    // Cek apakah asset exists
    const assetToDelete = await prisma.unit.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        assetTag: true,
      },
    });

    if (!assetToDelete) {
      return { success: false, message: "Asset tidak ditemukan!" };
    }

    // Hapus asset
    await prisma.unit.delete({
      where: { id },
    });

    revalidatePath("/dashboard/assets");

    return {
      success: true,
      message: `Asset ${assetToDelete.name} (${assetToDelete.assetTag}) berhasil dihapus!`,
    };
  } catch (error) {
    // Handle specific Prisma errors
    if (error instanceof Error && "code" in error) {
      if (error.code === "P2025") {
        return { success: false, message: "Asset tidak ditemukan!" };
      }
      if (error.code === "P2003") {
        return {
          success: false,
          message:
            "Asset tidak dapat dihapus karena masih terkait dengan data lain.",
        };
      }
    }

    return {
      success: false,
      message: "Gagal menghapus asset. Silakan coba lagi.",
    };
  }
}

// // Fungsi untuk mengambil data assets dan stats
// export async function getAssetsData() {
//   try {
//     const allAssets = await prisma.unit.findMany({
//       select: {
//         id: true,
//         assetTag: true,
//         name: true,
//         description: true,
//         categoryId: true,
//         status: true,
//         condition: true,
//         serialNumber: true,
//         location: true,
//         department: true,
//         manufacturer: true,
//         installDate: true,
//         warrantyExpiry: true,
//         lastMaintenance: true,
//         nextMaintenance: true,
//         assetValue: true,
//         utilizationRate: true,
//         createdAt: true,
//         createdById: true,
//         assignedToId: true,
//         breakdowns: {
//           where: {
//             status: {
//               in: ["pending", "in_progress"],
//             },
//           },
//           select: {
//             id: true,
//             status: true,
//             priority: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     // Hitung stats dari data yang sudah di-fetch
//     const totalAssets = allAssets.length;

//     // Hitung new assets bulan ini
//     const startOfMonth = new Date();

//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const newAssets = allAssets.filter(
//       (asset) => asset.createdAt >= startOfMonth,
//     ).length;

//     // Hitung active assets (operational dan dalam kondisi baik)
//     const activeAssets = allAssets.filter(
//       (asset) =>
//         asset.status?.toLowerCase() === "operational" &&
//         (asset.condition?.toLowerCase() === "good" ||
//           asset.condition?.toLowerCase() === "excellent" ||
//           !asset.condition),
//     ).length;

//     // Hitung assets dalam maintenance (status maintenance atau ada breakdown aktif)
//     const maintenanceAssets = allAssets.filter(
//       (asset) => asset.status === "maintenance" || asset.breakdowns.length > 0,
//     ).length;

//     // Hitung critical assets (kondisi buruk atau breakdown dengan priority tinggi)
//     const criticalAssets = allAssets.filter(
//       (asset) =>
//         asset.condition === "poor" ||
//         asset.condition === "critical" ||
//         asset.breakdowns.some(
//           (breakdown) =>
//             breakdown.priority === "HIGH" || breakdown.priority === "CRITICAL",
//         ),
//     ).length;

//     const assetStats = {
//       total: totalAssets,
//       new: newAssets,
//       active: activeAssets,
//       maintenance: maintenanceAssets,
//       critical: criticalAssets,
//     };

//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         photo: true,
//       },
//       orderBy: { name: "asc" },
//     });

//     return {
//       allAssets,
//       assetStats,
//       users,
//     };
//   } catch (error) {
//     throw new Error("Failed to fetch assets data");
//   }
// }

// Fungsi untuk mengambil data users
export async function getUsersData() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    throw new Error("Failed to fetch users data");
  }
}
