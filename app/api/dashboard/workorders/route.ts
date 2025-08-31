import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { prisma } from "@/lib/prisma";

// CORS allowlist configuration
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL || "",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

function isAllowedOrigin(origin?: string | null) {
  // Jika tidak ada header Origin, jangan izinkan (untuk memblokir Postman/curl)
  if (!origin) return false;
  try {
    const o = new URL(origin).origin;

    return ALLOWED_ORIGINS.includes(o);
  } catch {
    return false;
  }
}

function buildCorsHeaders(origin?: string | null) {
  if (!origin || !isAllowedOrigin(origin)) return {} as Record<string, string>;

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  } as Record<string, string>;
}

function jsonWithCors(
  data: any,
  init: ResponseInit = {},
  origin?: string | null,
) {
  const headers = new Headers(init.headers);
  const cors = buildCorsHeaders(origin);

  for (const [k, v] of Object.entries(cors)) headers.set(k, v);

  return NextResponse.json(data, { ...init, headers });
}

// -------- Rate limiting (Upstash) --------
// Gunakan singletons agar tidak re-init pada hot reload / serverless re-use
const redis =
  Redis.fromEnv?.() ||
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

const ratelimit = new Ratelimit({
  redis,
  // 15 permintaan per 1 menit per IP
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
  prefix: "wo:api",
});

function getClientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for");

  if (xf) return xf.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");

  if (realIp) return realIp;

  // Sebagai fallback, pakai user-agent untuk mengelompokkan kasar (tidak ideal)
  return req.headers.get("user-agent") || "unknown";
}

// Handle preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    // Jangan mengirim header CORS jika origin tidak diizinkan
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(origin),
  });
}

export async function GET(req: NextRequest) {
  // const session = await getServerSession(authOptions); //Proteksi API

  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Rate limiting lebih dulu
    const ip = getClientIp(req);
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `wo:get:${ip}`,
    );

    let originHeaderFor429 = req.headers.get("origin");

    if (!originHeaderFor429) {
      const ref = req.headers.get("referer");

      try {
        if (ref) originHeaderFor429 = new URL(ref).origin;
      } catch {}
    }

    if (!success) {
      const headers = new Headers(buildCorsHeaders(originHeaderFor429));

      headers.set(
        "Retry-After",
        Math.max(0, Math.ceil((reset - Date.now()) / 1000)).toString(),
      );
      headers.set("X-RateLimit-Limit", String(limit));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));

      return new NextResponse("Too Many Requests", { status: 429, headers });
    }

    let origin = req.headers.get("origin");

    // Jika tidak ada Origin, coba fallback ke Referer
    if (!origin) {
      const referer = req.headers.get("referer");

      try {
        if (referer) origin = new URL(referer).origin;
      } catch {
        // ignore parse error
      }
    }
    // Tolak jika origin (dari Origin/Referer) tidak di allowlist
    if (!isAllowedOrigin(origin)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    // Hindari multiple parsing URL
    const url = new URL(req.url);
    const search = url.searchParams;

    const id = search.get("id");
    const units = search.get("units") === "true";
    const nextNumber = search.get("nextNumber") === "true";
    const role = search.get("role");

    // 1. Return list unit
    if (units) {
      const unitsData = await prisma.unit.findMany({
        select: { id: true, name: true, assetTag: true },
        orderBy: { name: "asc" },
      });

      return jsonWithCors(
        unitsData,
        {
          headers: {
            "Cache-Control": "public, max-age=60", // Tambahan ringan
          },
        },
        origin,
      );
    }

    // 2. Return next breakdown number
    if (nextNumber && role) {
      const prefix =
        role === "super_admin" || role === "admin_elec" ? "WOIT-" : "WO-";

      const nextBreakdownNumber = await prisma.$transaction(async (tx) => {
        const last = await tx.breakdown.findFirst({
          where: { breakdownNumber: { startsWith: prefix } },
          orderBy: { breakdownNumber: "desc" },
          select: { breakdownNumber: true },
        });

        let nextNum = 1;
        const match = last?.breakdownNumber?.match(/\d+$/);

        if (match) nextNum = parseInt(match[0], 10) + 1;

        return `${prefix}${nextNum.toString().padStart(4, "0")}`;
      });

      return jsonWithCors({ nextBreakdownNumber }, {}, origin);
    }

    // 3. Return breakdown by ID
    if (id) {
      const breakdown = await prisma.breakdown.findUnique({
        where: { id },
        include: {
          unit: true,
          reportedBy: { select: { name: true, email: true, id: true } },
          inProgressBy: {
            select: { name: true, email: true, id: true, photo: true },
          },
          components: true,
          rfuReport: { include: { resolvedBy: true, actions: true } },
        },
      });

      if (!breakdown) {
        return jsonWithCors(null, { status: 404 }, origin);
      }

      return jsonWithCors(breakdown, {}, origin);
    }

    // 4. Return all breakdowns (default)
    const maxRetries = 3;
    let lastError;

    for (let i = 1; i <= maxRetries; i++) {
      try {
        const allBreakdowns = await prisma.breakdown.findMany({
          include: {
            reportedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                photo: true,
              },
            },
            inProgressBy: {
              select: { id: true, name: true, email: true, photo: true },
            },
            unit: {
              select: {
                id: true,
                assetTag: true,
                name: true,
                location: true,
                department: true,
                categoryId: true,
                status: true,
                serialNumber: true,
              },
            },
            components: true,
            rfuReport: {
              include: {
                resolvedBy: {
                  select: { id: true, name: true, email: true, photo: true },
                },
                actions: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const now = new Date();
        const thirtyDaysAgo = new Date(now);

        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Prehitung statistik tanpa mutasi array berkali-kali
        let total = 0,
          progress = 0,
          rfu = 0,
          pending = 0,
          overdue = 0;

        for (const b of allBreakdowns) {
          total++;
          if (b.status === "in_progress") progress++;
          else if (b.status === "rfu") rfu++;
          else if (b.status === "pending") {
            if (b.createdAt < thirtyDaysAgo) overdue++;
            else pending++;
          }
        }

        return jsonWithCors(
          {
            allBreakdowns,
            breakdownStats: { total, progress, rfu, pending, overdue },
          },
          {},
          origin,
        );
      } catch (error) {
        lastError = error;
        if (i < maxRetries)
          await new Promise((res) => setTimeout(res, 1000 * i));
      }
    }

    return jsonWithCors(
      {
        allBreakdowns: [],
        breakdownStats: {
          total: 0,
          progress: 0,
          rfu: 0,
          pending: 0,
          overdue: 0,
        },
      },
      { status: 500 },
      origin,
    );
  } catch (error) {
    let origin = req.headers.get("origin");

    if (!origin) {
      const referer = req.headers.get("referer");

      try {
        if (referer) origin = new URL(referer).origin;
      } catch {}
    }

    return jsonWithCors(
      { error: "Internal server error" },
      { status: 500 },
      origin,
    );
  }
}
