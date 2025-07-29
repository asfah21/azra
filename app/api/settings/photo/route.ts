import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size too large (max 1MB)" },
        { status: 400 },
      );
    }

    // Get user to check existing photo
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Delete old photo if exists
    if (user.photo && user.photo.startsWith("/uploads/")) {
      const oldPhotoPath = path.join(process.cwd(), "public", user.photo);

      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `user-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);
    const photoUrl = `/uploads/${fileName}`;

    // Update user photo
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { photo: photoUrl },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        phone: true,
        location: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Photo updated successfully",
      photoUrl,
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Error updating photo:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update photo" },
      { status: 500 },
    );
  }
}
