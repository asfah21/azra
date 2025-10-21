import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
    const file = formData.get("signature") as File;

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
    // Siapkan object key + content-type
    const ext = getExtFrom(file);
    const objectKey = `signature/user-${userId}-${Date.now()}${ext}`;
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
        ACL: "public-read" as any,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    // Bentuk URL publik
    const base =
      process.env.MINIO_PUBLIC_BASEURL ||
      `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    const signatureUrl = `${base.replace(/\/+$|\/$/g, "")}/${process.env.MINIO_BUCKET}/${encodeURI(objectKey)}`;

    // Simpan URL signature ke user
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: signatureUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Signature uploaded successfully",
      signatureUrl,
    });
  } catch (error) {
    consolePino.error("Error uploading signature:", error);

    return NextResponse.json(
      { success: false, message: "Failed to upload signature" },
      { status: 500 },
    );
  }
}
