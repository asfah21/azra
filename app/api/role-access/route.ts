import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { consolePino } from "@/lib/logger";

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const GET_RATE_LIMIT_MAX = 600; // lebih longgar untuk GET
const POST_RATE_LIMIT_MAX = 60; // moderat untuk POST
const RETRY_AFTER = 10; // seconds

function hitRateLimit(key: string, maxPerWindow: number) {
  const now = Date.now();
  const info = rateLimitMap.get(key) || { count: 0, last: now };

  if (now - info.last < RATE_LIMIT_WINDOW && info.count >= maxPerWindow)
    return true;
  if (now - info.last > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, last: now });
  } else {
    rateLimitMap.set(key, { count: info.count + 1, last: info.last });
  }

  return false;
}

// GET: Ambil konfigurasi role access (opsional: filter by role/roles)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const meRole = session.user?.role as Role | undefined;
  const isSuper = meRole === "super_admin";

  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get("role") as Role | null;
  const rolesParam = searchParams.get("roles");

  let where: any = undefined;

  if (isSuper) {
    if (rolesParam) {
      const list = rolesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as Role[];

      if (list.length > 0) where = { role: { in: list } };
    } else if (roleParam) {
      where = { role: roleParam };
    }
  } else if (meRole) {
    where = { role: meRole };
  }

  try {
    const data = await prisma.roleAccess.findMany({
      where,
      select: { id: true, menu: true, role: true },
      orderBy: [{ menu: "asc" }, { role: "asc" }],
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // cache pendek agar UI tidak terlalu sering hit API
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    consolePino.error("Error fetching role access:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Update konfigurasi role access (atomic, idempotent)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Tetap proteksi: hanya super_admin yang boleh update
  if (session.user?.role !== "super_admin") {
    return NextResponse.json(
      { message: "Forbidden: only Super Admin can update role access" },
      { status: 403 },
    );
  }

  // Rate limiting by user + path + method
  const url = new URL(request.url);
  const userKey = session.user?.email || session.user?.id || "anonymous";
  const rlKey = `${userKey}:${url.pathname}:POST`;

  if (hitRateLimit(rlKey, POST_RATE_LIMIT_MAX)) {
    return new NextResponse(
      JSON.stringify({ message: "Rate limit exceeded" }),
      {
        status: 429,
        headers: { "Retry-After": String(RETRY_AFTER) },
      },
    );
  }

  try {
    const body = await request.json();
    const menu = body?.menu as string | undefined;
    const roles = Array.isArray(body?.roles) ? (body.roles as Role[]) : [];

    if (!menu) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const uniqRoles = Array.from(new Set(roles));

    const rows = await prisma.$transaction(async (tx) => {
      // Hapus role yang tidak dipilih lagi
      await tx.roleAccess.deleteMany({
        where: { menu, NOT: { role: { in: uniqRoles } } },
      });

      // Tambah yang baru (skip duplikat)
      if (uniqRoles.length > 0) {
        await tx.roleAccess.createMany({
          data: uniqRoles.map((r) => ({ menu, role: r })),
          skipDuplicates: true,
        });
      }

      return tx.roleAccess.findMany({
        where: { menu },
        select: { id: true, menu: true, role: true },
        orderBy: { role: "asc" },
      });
    });

    return NextResponse.json({ success: true, rows }, { status: 200 });
  } catch (error) {
    consolePino.error("Error updating role access:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
