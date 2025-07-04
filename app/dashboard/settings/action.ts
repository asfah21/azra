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
  await prisma.user.update({
    where: { id: userId },
    data,
  });
  revalidatePath("/dashboard/settings");
}

// Update foto profile
export async function updatePhoto(
  userId: string,
  formData: FormData,
): Promise<string> {
  // Ambil user dari database
  const user = await prisma.user.findUnique({ where: { id: userId } });

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
  const fileName = `user-${userId}-${Date.now()}.jpg`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  await writeFile(filePath, buffer);

  const photoUrl = `/uploads/${fileName}`;

  await prisma.user.update({
    where: { id: userId },
    data: { photo: photoUrl },
  });
  revalidatePath("/dashboard/settings");

  return photoUrl;
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
