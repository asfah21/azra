// app/api/fingerprint/table/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { getUsers } from "@/actions/users";
import { mapDeviceSN } from "@/lib/device-mapping";
import { consolePino } from "@/lib/logger";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "http://188.245.70.138:8080/api/logs";
const API_KEY = process.env.ATT_KEY ?? "gsi-attendance-key";

// Cache TTL 5 menit (disarankan pindah Redis kalau traffic besar)
const CACHE_TTL = 5 * 60 * 1000;

// In-memory cache (per instance)
const cache = new Map<string, { data: any; timestamp: number }>();

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);

    return null;
  }

  return cached.data as T;
};

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Basic rate limiter (per instance)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string, max = 30): boolean => {
  const now = Date.now();
  const window = 60 * 1000;

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + window });

    return true;
  }

  if (record.count >= max) return false;

  record.count++;

  return true;
};

// Fetch backend logs
async function fetchBackend(limit: number, offset: number) {
  const url = new URL(BACKEND_URL);

  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY,
      Accept: "application/json",
    },
    next: { revalidate: 0 },
    // **Timeout important for production**
    signal: AbortSignal.timeout(7000),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  const json = await res.json().catch(() => ({}));

  const rows = json?.rows || json?.data || (Array.isArray(json) ? json : []);
  const total = json?.total ?? json?.count ?? json?.total_rows ?? null;

  return {
    rows: Array.isArray(rows) ? rows : [],
    total: Number(total) || null,
  };
}

// ===================================
//              MAIN
// ===================================
export async function GET(req: NextRequest) {
  try {
    // 1. Rate Limit
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for") ||
      "anonymous";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Auth
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Params
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const search = url.searchParams.get("search")?.trim().toLowerCase() || "";
    const join = url.searchParams.get("join")?.toLowerCase() || "";
    const pageSize = 20;

    // 4. Redirect search - hapus validasi yang terlalu ketat
    // Biarkan search lewat jika memang diperlukan untuk backward compatibility
    if (search) {
      const redirectUrl = `/api/fingerprint/search?q=${encodeURIComponent(
        search,
      )}&page=${page}`;

      return NextResponse.json(
        {
          message: "Use the search endpoint",
          searchEndpoint: redirectUrl,
        },
        {
          status: 400,
          headers: {
            "X-Search-Endpoint": redirectUrl,
          },
        },
      );
    }

    // 5. Cache Hit (non-search only)
    const cacheKey = `fp_${page}_${pageSize}_${join}`;
    const cached = getCached<{ rows: any[]; total: number }>(cacheKey);

    if (cached) {
      return NextResponse.json(
        {
          ...cached,
          page,
          pageSize,
          totalPages: Math.ceil(cached.total / pageSize),
          cached: true,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=60",
          },
        },
      );
    }

    // 6. Fetch backend
    const offset = (page - 1) * pageSize;
    const data = await fetchBackend(pageSize, offset);

    let rows = data.rows;
    let total = data.total;

    // 7. Join user data (cached)
    if (join === "user") {
      let users = getCached<any[]>("users");

      if (!users) {
        users = await getUsers();
        setCache("users", users);
      }

      const userMap: Record<string, any> = {};

      for (const u of users) {
        if (!u?.fid) continue;
        userMap[String(u.fid).trim()] = u;
      }

      rows = rows.map((r) => {
        const fid = r.user_id || r.fid || r.userId || r.uid || "";
        const key = String(fid).trim();

        return {
          ...r,
          user: userMap[key] || null,
        };
      });
    }

    // 7.5. Apply device mapping (always)
    rows = rows.map((r) => ({
      ...r,
      device_sn: mapDeviceSN(r.device_sn),
    }));

    // 8. Cache result
    if (rows && total !== null) {
      setCache(cacheKey, { rows, total });
    }

    // 9. Return
    return NextResponse.json(
      {
        rows,
        total,
        page,
        pageSize,
        totalPages: total ? Math.ceil(total / pageSize) : null,
        cached: false,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30", // safe caching
        },
      },
    );
  } catch (err) {
    consolePino.error("[fingerprint/table] ERROR:", err);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
