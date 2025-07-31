import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("Photo upload request received");
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      console.log("Unauthorized access attempt");

      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("User authenticated:", userId);
    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      console.log("No file in form data");

      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    console.log("File received:", file.name, file.size);
    if (file.size > 1024 * 1024) {
      console.log("File too large:", file.size);

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
      // Extract filename from the photo URL
      const fileName = user.photo.split("/").pop();

      if (fileName) {
        const oldPhotoPath = path.join(process.cwd(), "uploads", fileName);

        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (error) {
          console.error("Error deleting old photo:", error);
          // Continue with upload even if deletion fails
        }
      }
    }

    // Ensure uploads directory exists (outside of public directory)
    const uploadsDir = path.join(process.cwd(), "uploads");

    console.log("Uploads directory path:", uploadsDir);
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log("Uploads directory ensured");
    } catch (error) {
      console.log("Uploads directory already exists or created successfully");
    }

    // Save new photo
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `user-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    console.log("File will be saved to:", filePath);

    try {
      await writeFile(filePath, buffer);
      console.log("File saved successfully");
    } catch (error) {
      console.error("Error writing file:", error);

      return NextResponse.json(
        { success: false, message: "Failed to save file" },
        { status: 500 },
      );
    }

    // Store relative path from server root for retrieval
    const photoUrl = `/uploads/${fileName}`;

    console.log("Photo URL generated:", photoUrl);

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

    console.log("User profile updated successfully");

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

// Add a GET endpoint to serve uploaded files
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        { success: false, message: "File name is required" },
        { status: 400 },
      );
    }

    // Security check: ensure filename doesn't contain path traversal
    if (
      fileName.includes("..") ||
      fileName.includes("/") ||
      fileName.includes("\\")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid file name" },
        { status: 400 },
      );
    }

    // Use the uploads directory in the project root
    const filePath = path.join(process.cwd(), "uploads", fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 },
      );
    }

    // Read file and return it
    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate content type based on file extension
    const headers = new Headers();

    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      headers.set("Content-Type", "image/jpeg");
    } else if (fileName.endsWith(".png")) {
      headers.set("Content-Type", "image/png");
    } else if (fileName.endsWith(".gif")) {
      headers.set("Content-Type", "image/gif");
    } else {
      headers.set("Content-Type", "image/jpeg"); // default to jpeg
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving file:", error);

    return NextResponse.json(
      { success: false, message: "Failed to serve file" },
      { status: 500 },
    );
  }
}
