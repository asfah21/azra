// filepath: d:\PAM-PROJECT\azra\app\api\users\[id]\photo\route.ts
// Admin upload photo for specific user by ID (super_admin only)
import path from "path";
import fs from "fs";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import mime from "mime";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { consolePino } from "@/lib/logger";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

function getExtFrom(file: File) {
  const fromName = (file.name || "").split(".").pop();

  if (fromName && fromName.length <= 5) return "." + fromName.toLowerCase();
  const byMime = mime.getExtension(file.type || "");

  return byMime ? "." + byMime : ".bin";
}

function parseMinioKeyFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\/+/, "").split("/");
    const bucket = parts.shift() || "";
    const key = parts.join("/");

    return { bucket, key };
  } catch {
    return { bucket: "", key: "" };
  }
}

export async function POST(
  req: NextRequest,
  // { params }: { params: Promise<{ id: string }> },
  { params }: any,
) {
  try {
    const session = await getServerSession(authOptions);
    const actorId = session?.user?.id;
    const actorRole = (session as any)?.user?.role;

    if (!actorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    if (actorRole !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id: userId } = await params; // await params per Next.js requirement

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User id is required" },
        { status: 400 },
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

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // delete old photo (local uploads or MinIO)
    if (user.photo) {
      if (user.photo.startsWith("/uploads/")) {
        const oldPhotoPath = path.join(process.cwd(), "public", user.photo);

        if (fs.existsSync(oldPhotoPath)) {
          try {
            fs.unlinkSync(oldPhotoPath);
          } catch (e) {
            consolePino.warn("Failed to delete local file:", e);
          }
        }
      } else if (user.photo.startsWith("http")) {
        const { bucket, key } = parseMinioKeyFromUrl(user.photo);
        const bucketFromEnv = process.env.MINIO_BUCKET || "";

        if (bucket && key && bucket === bucketFromEnv) {
          try {
            await s3.send(
              new DeleteObjectCommand({ Bucket: bucket, Key: key }),
            );
          } catch (e) {
            consolePino.warn("Failed to delete MinIO object:", e);
          }
        }
      }
    }

    const ext = getExtFrom(file);
    const objectKey = `users/${userId}/user-${userId}-${Date.now()}${ext}`;
    const contentType =
      file.type || mime.getType(ext) || "application/octet-stream";

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET!,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read" as any,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const base =
      process.env.MINIO_PUBLIC_BASEURL ||
      `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    const photoUrl = `${base.replace(/\/+$/, "")}/${process.env.MINIO_BUCKET}/${encodeURI(objectKey)}`;

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
    consolePino.error("Error updating user photo:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update photo" },
      { status: 500 },
    );
  }
}
