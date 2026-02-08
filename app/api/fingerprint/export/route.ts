export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

import { getUsers } from "@/actions/users";
import { mapDeviceSN } from "@/lib/device-mapping";
import { consolePino } from "@/lib/logger";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

// Rate limiter untuk export (lebih ketat karena resource-intensive)
const exportRateLimitMap = new Map<string, number[]>();

function checkExportRateLimit(ip: string, maxRequests = 5): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const windowStart = now - windowMs;

  let timestamps = exportRateLimitMap.get(ip) || [];

  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  exportRateLimitMap.set(ip, timestamps);

  // Cleanup old IPs (1% chance)
  if (Math.random() < 0.01) {
    for (const [ipKey, times] of exportRateLimitMap.entries()) {
      const filtered = times.filter((t) => t > windowStart);

      if (filtered.length === 0) {
        exportRateLimitMap.delete(ipKey);
      }
    }
  }

  return true;
}

// Cache users dengan TTL lebih lama
let usersCache: { data: any[]; timestamp: number } | null = null;
const USERS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getCachedUsers() {
  const now = Date.now();

  if (usersCache && now - usersCache.timestamp < USERS_CACHE_TTL) {
    return usersCache.data;
  }

  const users = await getUsers();

  usersCache = { data: users, timestamp: now };

  return users;
}

async function fetchBackendBatch(
  limit: number,
  offset: number,
  signal?: AbortSignal,
) {
  const url = new URL(BACKEND_URL);

  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
    signal, // Support abort
    next: { revalidate: 0 }, // No Next.js cache untuk export
  });

  if (!res.ok) throw new Error(`Upstream error ${res.status}`);

  const json = await res.json().catch(() => ({}));
  const rows = Array.isArray(json?.rows)
    ? json.rows
    : Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];

  let total: number | null = null;

  if (typeof json?.total === "number") total = json.total;
  else if (typeof json?.count === "number") total = json.count;
  else if (typeof json?.total_rows === "number") total = json.total_rows;
  else if (typeof json?.total_rows === "string")
    total = Number(json.total_rows);
  else if ((rows as any)[0]?.total_rows)
    total = Number((rows as any)[0].total_rows);

  return { rows, total };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Rate Limiting (ketat untuk export)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    if (!checkExportRateLimit(ip, 5)) {
      return new Response(
        JSON.stringify({
          error: "Too many export requests. Please wait a moment.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }

    // 2. Parse body dengan validation
    const body = await req.json().catch(() => ({}));
    const range = String(body?.range || "today");
    const search = typeof body?.search === "string" ? body.search.trim() : "";
    const join = String(body?.join || "").toLowerCase();

    // Validate range
    const validRanges = ["today", "yesterday", "last7", "last30", "all"];

    if (!validRanges.includes(range)) {
      return new Response(
        JSON.stringify({ error: "Invalid range parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    consolePino.info(
      `[export] Starting export: range=${range}, search="${search}", join=${join}`,
    );

    // 3. Aggregate all logs dengan timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s max

    try {
      const batchSize = 500;
      let offset = 0;
      const first = await fetchBackendBatch(
        batchSize,
        offset,
        controller.signal,
      );
      let all = first.rows;
      const upstreamTotal = first.total;

      // Limit max pages untuk prevent memory issues
      const totalPagesGuess =
        upstreamTotal != null
          ? Math.min(Math.ceil(upstreamTotal / batchSize), 40) // Max 20k records
          : 5;

      consolePino.info(
        `[export] Total pages to fetch: ${totalPagesGuess}, estimated records: ${upstreamTotal || "unknown"}`,
      );

      // Fetch remaining pages dengan parallel limit
      const maxParallel = 3; // Fetch max 3 pages parallel

      for (
        let startPage = 2;
        startPage <= totalPagesGuess;
        startPage += maxParallel
      ) {
        const endPage = Math.min(startPage + maxParallel - 1, totalPagesGuess);
        const promises = [];

        for (let p = startPage; p <= endPage; p++) {
          offset = (p - 1) * batchSize;
          promises.push(
            fetchBackendBatch(batchSize, offset, controller.signal).catch(
              (error) => {
                consolePino.error(
                  `[export] Batch fetch error page ${p}:`,
                  error,
                );

                return { rows: [], total: null };
              },
            ),
          );
        }

        const results = await Promise.all(promises);

        for (const result of results) {
          all = all.concat(result.rows);
          if (result.rows.length < batchSize) {
            consolePino.info(
              `[export] Early stop: batch returned less than ${batchSize} rows`,
            );
            break;
          }
        }
      }

      consolePino.info(`[export] Fetched ${all.length} total records`);

      // 4. Join users if requested
      if (join === "user") {
        try {
          const usersList = await getCachedUsers();

          consolePino.info(
            `[export] Loaded ${usersList.length} users (cached)`,
          );

          // Build maps
          const nameMap: Record<string, string> = {};
          const deptMap: Record<string, string> = {};
          const jabatanMap: Record<string, string> = {};
          const nikMap: Record<string, string> = {};
          const photoMap: Record<string, string> = {};

          for (const u of usersList) {
            if (u?.fid != null) {
              const key = String(u.fid);

              nameMap[key] = u.name ?? "";
              deptMap[key] = u?.department ?? "";
              jabatanMap[key] = u?.jabatan ?? "";
              nikMap[key] = u?.nik != null ? String(u.nik) : "";
              photoMap[key] = u?.photo ?? "";
            }
          }

          // Join efficiently
          all = all.map((r: any) => {
            const rawFid = r?.user_id ?? r?.fid ?? r?.userId ?? r?.uid;
            const fidKey = rawFid != null ? String(rawFid) : undefined;
            const user = fidKey
              ? {
                  fid: fidKey,
                  name: nameMap[fidKey] ?? undefined,
                  nik: nikMap[fidKey] ?? undefined,
                  department: deptMap[fidKey] ?? undefined,
                  jabatan: jabatanMap[fidKey] ?? undefined,
                  photo: photoMap[fidKey] ?? undefined,
                }
              : undefined;

            return { ...r, user };
          });
        } catch (error) {
          consolePino.error("[export] User join error:", error);
        }
      }

      // 5. Filter by range (optimized)
      const pad = (n: number) => String(n).padStart(2, "0");
      const now = new Date();
      const todayUTC = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;

      let filtered = all;

      if (range === "today") {
        filtered = all.filter((r: any) =>
          String(r.timestamp || r.created_at || "").startsWith(todayUTC),
        );
      } else if (range === "yesterday") {
        const y = new Date(now);

        y.setUTCDate(y.getUTCDate() - 1);
        const yesterdayUTC = `${y.getUTCFullYear()}-${pad(y.getUTCMonth() + 1)}-${pad(y.getUTCDate())}`;
        const allow = new Set([todayUTC, yesterdayUTC]);

        filtered = all.filter((r: any) =>
          allow.has(String(r.timestamp || r.created_at || "").slice(0, 10)),
        );
      } else if (range === "last7" || range === "last30") {
        const days = range === "last7" ? 7 : 30;
        const allow = new Set<string>();

        for (let i = 0; i < days; i++) {
          const d = new Date(now);

          d.setUTCDate(d.getUTCDate() - i);
          allow.add(
            `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
          );
        }

        filtered = all.filter((r: any) =>
          allow.has(String(r.timestamp || r.created_at || "").slice(0, 10)),
        );
      }

      consolePino.info(
        `[export] After range filter: ${filtered.length} records`,
      );

      // 6. Apply search
      if (search) {
        const q = search.toLowerCase();

        filtered = filtered.filter((r: any) => {
          const user = r.user || {};

          return (
            String(user.name || "")
              .toLowerCase()
              .includes(q) ||
            String(user.nik || "")
              .toLowerCase()
              .includes(q) ||
            String(user.department || "")
              .toLowerCase()
              .includes(q) ||
            String(user.fid || "")
              .toLowerCase()
              .includes(q) ||
            String(r.user_id || "")
              .toLowerCase()
              .includes(q) ||
            String(r.device_sn || "")
              .toLowerCase()
              .includes(q)
          );
        });

        consolePino.info(
          `[export] After search filter: ${filtered.length} records`,
        );
      }

      // 7. Sort: department → name → timestamp desc
      const s = (v: unknown) => (v ?? "").toString().toLowerCase();
      const sorted = [...filtered].sort((a: any, b: any) => {
        const deptA = s(a.user?.department ?? "");
        const deptB = s(b.user?.department ?? "");

        if (deptA !== deptB) return deptA.localeCompare(deptB);

        const nameA = s(a.user?.name ?? "");
        const nameB = s(b.user?.name ?? "");

        if (nameA !== nameB) return nameA.localeCompare(nameB);

        const tA = new Date(a.timestamp ?? a.created_at ?? 0).getTime();
        const tB = new Date(b.timestamp ?? b.created_at ?? 0).getTime();

        return tB - tA; // newest first
      });

      // 8. Filter only valid attendance types (0, 1, 4, 5) for export
      const finalFiltered = sorted.filter((r: any) => {
        const t = Number(r.type);

        return [0, 1, 4, 5].includes(t);
      });

      // 9. Build export data
      const exportData = finalFiltered.map((r: any, i: number) => {
        const ts = String(r.timestamp || r.created_at || "");
        const date = ts.slice(0, 10);
        const time = ts.slice(11, 19);
        const typeLabel = ((): string => {
          const t = Number(r.type);

          if (t === 0) return "Masuk";
          if (t === 1) return "Pulang";
          if (t === 4) return "Lembur Masuk";
          if (t === 5) return "Lembur Pulang";

          return "-";
        })();

        return {
          NO: i + 1,
          NAME: r.user?.name ?? String(r.user_id ?? "-"),
          NIK: r.user?.nik ?? "-",
          DIVISI: r.user?.department ?? "-",
          JABATAN: r.user?.jabatan ?? "-",
          TYPE: typeLabel,
          TIME: time,
          DATE: date,
          FID: r.user?.fid ?? r.user_id ?? "-",
          LOKASI: mapDeviceSN(r.device_sn), // Apply device mapping
        };
      });

      consolePino.info(
        `[export] Generating Excel with ${exportData.length} rows...`,
      );

      // 9. Generate Excel
      const ws = XLSX.utils.json_to_sheet(exportData, {
        header: [
          "NO",
          "NAME",
          "NIK",
          "DIVISI",
          "JABATAN",
          "TYPE",
          "TIME",
          "DATE",
          "FID",
          "LOKASI",
        ],
      });

      ws["!cols"] = [
        { wch: 6 }, // NO
        { wch: 24 }, // NAME
        { wch: 13 }, // NIK
        { wch: 14 }, // DIVISI
        { wch: 20 }, // JABATAN
        { wch: 12 }, // TYPE
        { wch: 14 }, // TIME
        { wch: 12 }, // DATE
        { wch: 10 }, // FID
        { wch: 18 }, // LOKASI
      ];

      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "logs");

      const arrayBuffer = XLSX.write(wb, {
        type: "array",
        bookType: "xlsx",
      }) as ArrayBuffer;

      // 10. Generate filename
      const baseName = (() => {
        if (range === "today") return "fingerprint_today";
        if (range === "yesterday") return "fingerprint_yesterday";
        if (range === "last7") return "fingerprint_last_7_days";
        if (range === "last30") return "fingerprint_last_30_days";

        return "fingerprint_all";
      })();

      const filename = `${baseName}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;

      const responseTime = Date.now() - startTime;

      consolePino.info(
        `[export] Export completed in ${responseTime}ms, file: ${filename}`,
      );

      return new Response(new Uint8Array(arrayBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Response-Time": `${responseTime}ms`,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    consolePino.error("[export] Error:", error);

    // Handle specific errors
    if (error.name === "AbortError") {
      return new Response(
        JSON.stringify({
          error: "Export timeout (60s). Try a smaller date range.",
          responseTime: `${responseTime}ms`,
        }),
        {
          status: 504,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Export failed",
        message: error.message || "Unknown error",
        responseTime: `${responseTime}ms`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => {
    consolePino.info("[export] Clearing caches...");
    usersCache = null;
    exportRateLimitMap.clear();
  });
}
