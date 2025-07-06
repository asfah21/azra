"use server";

import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

// Ambil data profile user (misal userId = 1)
export async function getProfile(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

// Update data profile
export async function updateProfile(userId: string, data: any) {
  try {
    // Jika userId adalah "system", cari user pertama yang ada
    let actualUserId = userId;
    
    if (userId === "system") {
      const firstUser = await prisma.user.findFirst({
        select: { id: true }
      });
      
      if (!firstUser) {
        throw new Error("Tidak ada user yang tersedia di database.");
      }
      
      actualUserId = firstUser.id;
    }

    // Cek apakah user exists sebelum update
    const existingUser = await prisma.user.findUnique({
      where: { id: actualUserId }
    });

    if (!existingUser) {
      throw new Error("User tidak ditemukan.");
    }

    await prisma.user.update({
      where: { id: actualUserId },
      data,
    });
    
    revalidatePath("/dashboard/settings");
    
    return { success: true, message: "Profile berhasil diupdate." };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal mengupdate profile." 
    };
  }
}

// Update foto profile
export async function updatePhoto(
  userId: string,
  formData: FormData,
): Promise<{ success: boolean; message: string; photoUrl?: string }> {
  try {
    // Jika userId adalah "system", cari user pertama yang ada
    let actualUserId = userId;
    
    if (userId === "system") {
      const firstUser = await prisma.user.findFirst({
        select: { id: true }
      });
      
      if (!firstUser) {
        throw new Error("Tidak ada user yang tersedia di database.");
      }
      
      actualUserId = firstUser.id;
    }

    // Ambil user dari database
    const user = await prisma.user.findUnique({ where: { id: actualUserId } });

    if (!user) {
      throw new Error("User tidak ditemukan.");
    }

    // Cek dan hapus foto lama jika ada (dan bukan default)
    if (user?.photo && user.photo.startsWith("/uploads/")) {
      const oldPhotoPath = path.join(process.cwd(), "public", user.photo);

      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const file = formData.get("photo") as File;

    if (!file) throw new Error("No file uploaded");
    if (file.size > 1024 * 1024) throw new Error("Ukuran gambar maksimal 1MB");

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `user-${actualUserId}-${Date.now()}.jpg`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);

    const photoUrl = `/uploads/${fileName}`;

    await prisma.user.update({
      where: { id: actualUserId },
      data: { photo: photoUrl },
    });
    
    revalidatePath("/dashboard/settings");

    return { success: true, message: "Foto berhasil diupdate.", photoUrl };
  } catch (error) {
    console.error("Error updating photo:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal mengupdate foto." 
    };
  }
}

// Fungsi untuk mengambil data settings (mirip dengan getAssetsData)
export async function getSettingsData(userId: string) {
  try {
    // Jika userId adalah "system", ambil user pertama yang ada
    let whereClause = { id: userId };
    
    if (userId === "system") {
      // Ambil user pertama yang ada di database
      const firstUser = await prisma.user.findFirst({
        select: { id: true }
      });
      
      if (!firstUser) {
        return {
          success: false,
          message: "Tidak ada user yang tersedia di database.",
          profile: null,
        };
      }
      
      whereClause = { id: firstUser.id };
    }

    const profile = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return {
        success: false,
        message: "Profil pengguna tidak ditemukan.",
        profile: null,
      };
    }

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error("Error fetching settings data:", error);

    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data profil pengguna.",
      profile: null,
    };
  }
}
