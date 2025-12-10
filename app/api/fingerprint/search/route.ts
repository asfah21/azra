// app/api/fingerprint/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { getUsers } from "@/actions/users";
import { mapDeviceSN } from "@/lib/device-mapping";
import { consolePino } from "@/lib/logger";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

// Cache configuration
const CACHE_CONFIG = {
  SEARCH_RESULT: 2 * 60 * 1000, // 2 minutes
  ALL_DATA: 5 * 60 * 1000, // 5 minutes (data lengkap)
  USERS: 15 * 60 * 1000, // 15 minutes
  MAX_ENTRIES: 200, // Max cache entries
};

// Enhanced cache with automatic cleanup
const searchCache = new Map<
  string,
  { data: any; timestamp: number; hits: number }
>();
const allDataCache = new Map<string, { data: any; timestamp: number }>();
const usersCache = new Map<string, { data: any; timestamp: number }>();

// Cleanup cache periodically (prevent memory leak)
function cleanupCache(cache: Map<string, any>, ttl: number) {
  const now = Date.now();
  const entries = Array.from(cache.entries());

  // Remove expired entries
  for (const [key, value] of entries) {
    if (now - value.timestamp > ttl) {
      cache.delete(key);
    }
  }

  // If still too many, remove least used (for search cache)
  if (cache === searchCache && cache.size > CACHE_CONFIG.MAX_ENTRIES) {
    const sorted = Array.from(cache.entries()).sort(
      (a, b) => (a[1].hits || 0) - (b[1].hits || 0),
    );

    const toRemove = Math.floor(cache.size * 0.2); // Remove 20%

    for (let i = 0; i < toRemove; i++) {
      cache.delete(sorted[i][0]);
    }
  }
}

// Auto cleanup every 5 minutes
setInterval(
  () => {
    cleanupCache(searchCache, CACHE_CONFIG.SEARCH_RESULT);
    cleanupCache(allDataCache, CACHE_CONFIG.ALL_DATA);
    cleanupCache(usersCache, CACHE_CONFIG.USERS);
  },
  5 * 60 * 1000,
);

function getCached<T>(
  cache: Map<string, any>,
  key: string,
  ttl: number,
): T | null {
  const cached = cache.get(key);

  if (!cached || Date.now() - cached.timestamp > ttl) {
    cache.delete(key);

    return null;
  }

  // Track hits for search cache
  if (cache === searchCache && cached.hits !== undefined) {
    cached.hits++;
  }

  return cached.data as T;
}

function setCache(cache: Map<string, any>, key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    hits: cache === searchCache ? 0 : undefined,
  });
}

// Enhanced rate limiter with sliding window
const rateLimitMap = new Map<string, number[]>();

function checkSearchRateLimit(ip: string, maxRequests = 15): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const windowStart = now - windowMs;

  // Get and filter timestamps
  let timestamps = rateLimitMap.get(ip) || [];

  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // Cleanup old IPs randomly (1% chance)
  if (Math.random() < 0.01) {
    for (const [ipKey, times] of rateLimitMap.entries()) {
      const filtered = times.filter((t) => t > windowStart);

      if (filtered.length === 0) {
        rateLimitMap.delete(ipKey);
      } else {
        rateLimitMap.set(ipKey, filtered);
      }
    }
  }

  return true;
}

async function fetchAllDataForSearch() {
  const batch = 500;
  let allRows: any[] = [];

  // First batch to get total
  const first = await fetch(`${BACKEND_URL}?limit=${batch}&offset=0`, {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
    // Tambah timeout untuk production
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!first.ok) {
    throw new Error(`Backend error: ${first.status}`);
  }

  const firstJson = await first.json();
  const firstRows = firstJson?.rows || firstJson?.data || [];

  allRows.push(...firstRows);

  const total = firstJson?.total || 0;
  const totalPages = Math.ceil(total / batch);

  // Limit to max 20 pages (10k records)
  const maxPages = Math.min(totalPages, 20);

  // Fetch remaining pages in parallel dengan error handling
  const promises = [];

  for (let p = 2; p <= maxPages; p++) {
    const pageOffset = (p - 1) * batch;

    promises.push(
      fetch(`${BACKEND_URL}?limit=${batch}&offset=${pageOffset}`, {
        headers: { "X-API-Key": API_KEY, Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Page ${p} failed: ${res.status}`);

          return res.json();
        })
        .catch((err) => {
          consolePino.error(`[fetchAllData] Page ${p} error:`, err);

          return null; // Continue despite error
        }),
    );
  }

  // Use allSettled untuk handle partial failures
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const rows = result.value?.rows || result.value?.data || [];

      allRows.push(...rows);
    }
  }

  return { rows: allRows, total };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Rate Limiting dengan sliding window
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkSearchRateLimit(ip, 15)) {
      return NextResponse.json(
        { error: "Too many search requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    // 2. JWT Authentication
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 },
      );
    }

    // 3. Parse Query Params
    const inUrl = new URL(req.url);
    const query = (inUrl.searchParams.get("q") || "").trim().toLowerCase();
    const page = Math.max(Number(inUrl.searchParams.get("page") || 1), 1);
    const pageSize = 20;

    // Validation
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 },
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: "Search query too long (max 100 characters)" },
        { status: 400 },
      );
    }

    // 4. Check Cache First (paling penting!)
    const cacheKey = `search_${query}_${page}`;
    const cachedResult = getCached<{ rows: any[]; total: number }>(
      searchCache,
      cacheKey,
      CACHE_CONFIG.SEARCH_RESULT,
    );

    if (cachedResult) {
      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        rows: cachedResult.rows,
        total: cachedResult.total,
        pageSize,
        page,
        query,
        totalPages: Math.ceil(cachedResult.total / pageSize),
        cached: true,
        responseTime: `${responseTime}ms`,
      });
    }

    // 5. Fetch All Data (with separate cache)
    const allDataCacheKey = "all_fingerprint_data";
    let allData = getCached<{ rows: any[]; total: number }>(
      allDataCache,
      allDataCacheKey,
      CACHE_CONFIG.ALL_DATA,
    );

    if (!allData) {
      consolePino.info("[search] Fetching all data from backend...");
      allData = await fetchAllDataForSearch();
      setCache(allDataCache, allDataCacheKey, allData);
      consolePino.info(`[search] Fetched ${allData.rows.length} records`);
    }

    let rows = allData.rows;

    // 6. Join Users (with separate cache & longer TTL)
    let users = getCached<any[]>(usersCache, "users_data", CACHE_CONFIG.USERS);

    if (!users) {
      consolePino.info("[search] Fetching users...");
      users = await getUsers();
      setCache(usersCache, "users_data", users);
      consolePino.info(`[search] Fetched ${users.length} users`);
    }

    // Build user map (optimized)
    const userMap: Record<string, any> = {};

    for (const u of users) {
      if (u?.fid) {
        const key = String(u.fid).trim();

        userMap[key] = {
          fid: key,
          name: u.name || "",
          nik: u.nik || "",
          department: u.department || "",
          jabatan: u.jabatan || "",
          photo: u.photo || "",
        };
      }
    }

    // Join user data
    rows = rows.map((r) => {
      const fid = r.user_id || r.fid || r.userId || r.uid || null;
      const key = fid !== null ? String(fid).trim() : null;

      return {
        ...r,
        user: key ? userMap[key] || null : null,
        device_sn: mapDeviceSN(r.device_sn), // Apply device mapping
      };
    });

    // 7. Search Filter (optimized dengan multi-term support)
    const searchTerms = query.split(/\s+/).filter(Boolean);

    const filteredRows = rows.filter((r) => {
      const u = r.user || {};

      // Gabung semua field jadi satu string (lebih efisien)
      const searchText = [
        r.device_sn,
        r.user_id,
        u.name,
        u.nik,
        u.department,
        u.jabatan,
        u.fid,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Check semua term (support "Sulfian Aji" = "sulfian" AND "aji")
      return searchTerms.every((term) => searchText.includes(term));
    });

    const total = filteredRows.length;

    // 8. Pagination
    const start = (page - 1) * pageSize;
    const paginatedRows = filteredRows.slice(start, start + pageSize);

    // 9. Cache Search Result
    setCache(searchCache, cacheKey, { rows: paginatedRows, total });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      rows: paginatedRows,
      total,
      pageSize,
      page,
      query,
      totalPages: Math.ceil(total / pageSize),
      cached: false,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    consolePino.error("[fingerprint/search] Error:", error);

    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
        responseTime: `${responseTime}ms`,
      },
      { status: 500 },
    );
  }
}

// Graceful shutdown untuk cleanup
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => {
    consolePino.info("[search] Clearing caches...");
    searchCache.clear();
    allDataCache.clear();
    usersCache.clear();
    rateLimitMap.clear();
  });
}
