// app/api/fingerprint/card/route.ts
import { NextRequest, NextResponse } from "next/server";

import { consolePino } from "@/lib/logger";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";
const INTERNAL_KEY = process.env.INTERNAL_FP_API_KEY;

// Cache configuration untuk card stats
const CARD_CACHE_TTL = 3 * 60 * 1000; // 3 menit (card stats jarang berubah)
const cardCache = new Map<string, { data: any; timestamp: number }>();

// Rate limiter untuk card endpoint
const cardRateLimitMap = new Map<string, number[]>();

// Cleanup cache setiap 10 menit
setInterval(
  () => {
    const now = Date.now();

    for (const [key, value] of cardCache.entries()) {
      if (now - value.timestamp > CARD_CACHE_TTL) {
        cardCache.delete(key);
      }
    }

    // Cleanup rate limit map
    const windowStart = now - 60 * 1000;

    for (const [ip, timestamps] of cardRateLimitMap.entries()) {
      const filtered = timestamps.filter((t) => t > windowStart);

      if (filtered.length === 0) {
        cardRateLimitMap.delete(ip);
      } else {
        cardRateLimitMap.set(ip, filtered);
      }
    }
  },
  10 * 60 * 1000,
);

function getCachedCard(key: string): any | null {
  const cached = cardCache.get(key);

  if (!cached || Date.now() - cached.timestamp > CARD_CACHE_TTL) {
    cardCache.delete(key);

    return null;
  }

  return cached.data;
}

function setCachedCard(key: string, data: any) {
  cardCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function checkCardRateLimit(ip: string, maxRequests = 30): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const windowStart = now - windowMs;

  let timestamps = cardRateLimitMap.get(ip) || [];

  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  cardRateLimitMap.set(ip, timestamps);

  return true;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Rate Limiting (lebih generous untuk card karena read-only)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkCardRateLimit(ip, 30)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    // 2. Internal Security Check
    const reqKey = req.headers.get("x-internal-key");

    if (!reqKey || reqKey !== INTERNAL_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Extract & Validate Params
    const limit = req.nextUrl.searchParams.get("limit") ?? "500";
    const offset = req.nextUrl.searchParams.get("offset") ?? "0";

    // Validate numbers
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 1 || offsetNum < 0) {
      return NextResponse.json(
        { error: "Invalid limit or offset parameters" },
        { status: 400 },
      );
    }

    // Limit max untuk prevent overload
    if (limitNum > 1000) {
      return NextResponse.json(
        { error: "Limit too high (max 1000)" },
        { status: 400 },
      );
    }

    // 4. Check Cache First
    const cacheKey = `card_${limit}_${offset}`;
    const cachedData = getCachedCard(cacheKey);

    if (cachedData) {
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        ...cachedData,
        cached: true,
        responseTime: `${responseTime}ms`,
      });
    }

    // 5. Fetch from Backend
    const url = `${BACKEND_URL}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

    const backendRes = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY,
        Accept: "application/json",
      },
      // Production optimizations
      signal: AbortSignal.timeout(15000), // 15s timeout untuk card (lebih banyak data)
      next: { revalidate: 180 }, // Next.js cache 3 menit
    });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");

      consolePino.error(`[card] Backend error ${backendRes.status}:`, text);

      return NextResponse.json(
        { error: `Backend error (${backendRes.status})` },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();

    // 6. Cache the result
    setCachedCard(cacheKey, data);

    const responseTime = Date.now() - startTime;

    // 7. Return with metadata
    return NextResponse.json({
      ...data,
      cached: false,
      responseTime: `${responseTime}ms`,
    });
  } catch (err: any) {
    const responseTime = Date.now() - startTime;

    consolePino.error("[card] Error:", err);

    // Handle timeout separately
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timeout. Backend took too long to respond.",
          responseTime: `${responseTime}ms`,
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch fingerprint logs",
        message: err.message || "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 500 },
    );
  }
}

// Graceful shutdown cleanup
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => {
    consolePino.info("[card] Clearing cache...");
    cardCache.clear();
    cardRateLimitMap.clear();
  });
}
