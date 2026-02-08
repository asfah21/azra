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

    // Validate storage configuration early to avoid opaque 500s
    const {
      MINIO_ENDPOINT,
      MINIO_PORT,
      MINIO_BUCKET,
      MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY,
      MINIO_USE_SSL,
      MINIO_PUBLIC_BASEURL,
    } = process.env as Record<string, string | undefined>;

    const missing: string[] = [];

    if (!MINIO_ENDPOINT) missing.push("MINIO_ENDPOINT");
    if (!MINIO_PORT) missing.push("MINIO_PORT");
    if (!MINIO_BUCKET) missing.push("MINIO_BUCKET");
    if (!MINIO_ACCESS_KEY) missing.push("MINIO_ACCESS_KEY");
    if (!MINIO_SECRET_KEY) missing.push("MINIO_SECRET_KEY");

    if (missing.length) {
      consolePino.error("Upload photo misconfig: missing envs", missing);

      return NextResponse.json(
        {
          success: false,
          message: `Storage not configured: ${missing.join(", ")}`,
        },
        { status: 500 },
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
        const bucketFromEnv = MINIO_BUCKET || "";

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

    try {
      consolePino.info("Attempting S3 upload", {
        bucket: MINIO_BUCKET,
        key: objectKey,
        endpoint: MINIO_ENDPOINT,
        port: MINIO_PORT,
        useSSL: MINIO_USE_SSL,
        fileSize: buffer.length,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: MINIO_BUCKET!,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
          // Rely on bucket policy for public access; ACL often blocked on MinIO/S3
          // ACL: "public-read" as any,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      consolePino.info("S3 upload successful", { objectKey });
    } catch (e: any) {
      consolePino.error("PutObject failed", {
        name: e?.name,
        message: e?.message,
        code: e?.Code || e?.code,
        stack: e?.stack,
        endpoint: MINIO_ENDPOINT,
        port: MINIO_PORT,
        bucket: MINIO_BUCKET,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Upload failed: ${e?.message || e?.code || "S3 error"}. Check server logs for details.`,
          error: {
            code: e?.Code || e?.code,
            name: e?.name,
          },
        },
        { status: 500 },
      );
    }

    const base =
      MINIO_PUBLIC_BASEURL ||
      `${MINIO_USE_SSL === "true" ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`;
    const photoUrl = `${base.replace(/\/+$/, "")}/${MINIO_BUCKET}/${encodeURI(objectKey)}`;

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
  } catch (error: any) {
    consolePino.error("Error updating user photo:", {
      error: error?.message,
      stack: error?.stack,
      name: error?.name,
    });

    return NextResponse.json(
      {
        success: false,
        message: `Failed to update photo: ${error?.message || "Unknown error"}`,
        error: {
          name: error?.name,
          message: error?.message,
        },
      },
      { status: 500 },
    );
  }
}
