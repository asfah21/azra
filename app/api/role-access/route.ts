import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { consolePino } from "@/lib/logger";
// import { z } from "zod";
// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 20 requests per window (lebih longgar)

// GET: Ambil semua konfigurasi role access
export async function GET() {
  const session = await getServerSession(authOptions); //Proteksi API

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Rate limiting by user
  const userKey = session.user?.email || session.user?.id || "anonymous";
  const now = Date.now();
  const userRate = rateLimitMap.get(userKey) || { count: 0, last: now };

  if (
    now - userRate.last < RATE_LIMIT_WINDOW &&
    userRate.count >= RATE_LIMIT_MAX
  ) {
    return NextResponse.json(
      { message: "Rate limit exceeded" },
      { status: 429 },
    );
  }
  if (now - userRate.last > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userKey, { count: 1, last: now });
  } else {
    rateLimitMap.set(userKey, {
      count: userRate.count + 1,
      last: userRate.last,
    });
  }
  try {
    const data = await prisma.roleAccess.findMany();

    return NextResponse.json(data);
  } catch (error) {
    consolePino.error("Error fetching role access:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Update konfigurasi role access
export async function POST(request: Request) {
  const session = await getServerSession(authOptions); //Proteksi API

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Proteksi role: hanya super_admin
  if (session.user?.role !== "super_admin") {
    return NextResponse.json(
      { message: "Forbidden: only Super Admin can update role access" },
      { status: 403 },
    );
  }
  // Rate limiting by user
  const userKey = session.user?.email || session.user?.id || "anonymous";
  const now = Date.now();
  const userRate = rateLimitMap.get(userKey) || { count: 0, last: now };

  if (
    now - userRate.last < RATE_LIMIT_WINDOW &&
    userRate.count >= RATE_LIMIT_MAX
  ) {
    return NextResponse.json(
      { message: "Rate limit exceeded" },
      { status: 429 },
    );
  }
  if (now - userRate.last > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userKey, { count: 1, last: now });
  } else {
    rateLimitMap.set(userKey, {
      count: userRate.count + 1,
      last: userRate.last,
    });
  }
  try {
    const body = await request.json();

    // Validasi sederhana
    if (
      !body.menu ||
      typeof body.menu !== "string" ||
      !Array.isArray(body.roles)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    // Hapus semua roleAccess untuk menu ini
    await prisma.roleAccess.deleteMany({ where: { menu: body.menu } });
    // Tambahkan role baru
    const created = await Promise.all(
      body.roles.map((role: Role) =>
        prisma.roleAccess.create({ data: { menu: body.menu, role } }),
      ),
    );

    return NextResponse.json({ success: true, created });
  } catch (error) {
    consolePino.error("Error updating role access:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
