// app/api/settings/photo/route.ts
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

export const runtime = "nodejs"; // pastikan route ini berjalan di Node runtime (bukan Edge)

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true, // wajib untuk MinIO
});

function getExtFrom(file: File) {
  // 1) coba dari file.name, 2) fallback dari mime type, 3) default .bin
  const fromName = (file.name || "").split(".").pop();

  if (fromName && fromName.length <= 5) return "." + fromName.toLowerCase();
  const byMime = mime.getExtension(file.type || "");

  return byMime ? "." + byMime : ".bin";
}

function parseMinioKeyFromUrl(url: string) {
  // dukung dua pola umum:
  // http://host:9000/<bucket>/<key>
  // atau kalau suatu saat pakai subdomain-style, sesuaikan di sini.
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

    // cek user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Hapus foto lama (mendukung dua kasus: local /uploads dan URL MinIO)
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

    // Siapkan object key + content-type
    const ext = getExtFrom(file);
    const objectKey = `users/${userId}/user-${userId}-${Date.now()}${ext}`;
    const contentType =
      file.type || mime.getType(ext) || "application/octet-stream";

    // Upload ke MinIO
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET!,
        Key: objectKey,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read" as any, // MinIO mengabaikan ACL jika bucket policy sudah anonymous read; tidak masalah
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    // Bentuk URL publik
    const base =
      process.env.MINIO_PUBLIC_BASEURL ||
      `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    const photoUrl = `${base.replace(/\/+$/, "")}/${process.env.MINIO_BUCKET}/${encodeURI(objectKey)}`;

    // Update user
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
    consolePino.error("Error updating photo:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update photo" },
      { status: 500 },
    );
  }
}
