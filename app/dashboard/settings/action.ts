"use server";

import { writeFile } from "fs/promises";
import path from "path";

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
): Promise<void> {
  const file = formData.get("photo") as File;

  if (!file) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `user-${userId}-${Date.now()}.jpg`;
  const filePath = path.join(process.cwd(), "public", "uploads", fileName);

  await writeFile(filePath, buffer);

  await prisma.user.update({
    where: { id: userId },
    data: { photo: `/uploads/${fileName}` },
  });
  revalidatePath("/dashboard/settings");
}
