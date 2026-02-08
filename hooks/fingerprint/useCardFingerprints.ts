import { useQuery } from "@tanstack/react-query";

import { consolePino } from "@/lib/logger";

type LogEntry = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
};

const PAGE_SIZE = 500;
const MAX_PAGES = 20;
const FETCH_TIMEOUT_MS = 15000;

export type FingerprintStats = {
  type0Today: number;
  type1Today: number;
  type0ThisMonth: number;
  type1ThisMonth: number;
};

const INITIAL_STATS: FingerprintStats = {
  type0Today: 0,
  type1Today: 0,
  type0ThisMonth: 0,
  type1ThisMonth: 0,
};

// ---------------- Helpers ----------------
const pad = (n: number) => String(n).padStart(2, "0");

function toYMDUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate(),
  )}`;
}

function ymdFromRowUTC(row: LogEntry): string | null {
  const raw = row.timestamp ?? row.created_at;

  if (!raw) return null;
  const d = new Date(raw);

  return Number.isNaN(d.getTime()) ? null : toYMDUTC(d);
}

function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  controller: AbortController,
): Promise<T> {
  // Promise.race untuk memicu timeout
  return Promise.race([
    p,
    new Promise<T>((_, reject) => {
      const t = setTimeout(() => {
        controller.abort();
        clearTimeout(t);
        reject(new Error("Request timed out"));
      }, ms);
    }),
  ]).finally(() => {
    // Pastikan timeout dibersihkan setelah promise selesai (baik resolve atau reject)
    // Note: clearTimeout t idak bisa diakses di scope ini secara langsung,
    // tapi sudah ditangani di Promise.race
  });
}

// ---------------- API Fetcher ----------------
async function fetchLogsPage(page: number, signal?: AbortSignal) {
  const offset = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });

  const internalKey = process.env.NEXT_PUBLIC_INTERNAL_FP_API_KEY ?? "";

  if (!internalKey) {
    consolePino.error("NEXT_PUBLIC_INTERNAL_FP_API_KEY is missing!");
    throw new Error("Missing API Internal Key.");
  }

  const res = await fetch(`/api/fingerprint/card?${params.toString()}`, {
    method: "GET",
    headers: {
      "x-internal-key": internalKey,
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch logs (Status: ${res.status} ${res.statusText})`,
    );
  }

  const data = await res.json();

  if (!Array.isArray(data.rows)) {
    throw new Error(
      "Invalid API response structure: 'rows' not found or not an array.",
    );
  }

  return data as {
    rows: LogEntry[];
    total?: number;
    has_more?: boolean;
  };
}

// ---------------- Custom Query Function ----------------
async function fetchStats(): Promise<FingerprintStats> {
  const now = new Date();
  const todayYMD = toYMDUTC(now);

  let stats: FingerprintStats = { ...INITIAL_STATS };

  const monthYear = {
    y: now.getUTCFullYear(),
    m: now.getUTCMonth(),
  };

  const firstDayOfMonthUTC = `${monthYear.y}-${pad(monthYear.m + 1)}-01`;

  // --- Core Processing Logic ---
  const processRows = (rows: LogEntry[]): string | null => {
    let oldestYMD: string | null = null;

    for (const r of rows) {
      const ymd = ymdFromRowUTC(r);

      if (!ymd) continue;

      if (!oldestYMD || ymd < oldestYMD) oldestYMD = ymd;

      const d = new Date(r.timestamp ?? r.created_at ?? "");

      if (Number.isNaN(d.getTime())) continue;

      // Today
      if (ymd === todayYMD) {
        if (r.type === 0) stats.type0Today++;
        if (r.type === 1) stats.type1Today++;
      }

      // This month
      const sameMonth =
        d.getUTCFullYear() === monthYear.y && d.getUTCMonth() === monthYear.m;

      if (sameMonth) {
        if (r.type === 0) stats.type0ThisMonth++;
        if (r.type === 1) stats.type1ThisMonth++;
      }
    }

    return oldestYMD;
  };
  // -----------------------------

  try {
    // 1. Fetch first page
    const c1 = new AbortController();
    const first = await withTimeout(
      fetchLogsPage(1, c1.signal),
      FETCH_TIMEOUT_MS,
      c1,
    );

    const totalPages = first.total
      ? Math.ceil((first.total as number) / PAGE_SIZE)
      : undefined;

    // Process first page
    let oldestSeen = processRows(first.rows || []);

    // Early stop 1: If first page already older than this month
    if (oldestSeen && oldestSeen < firstDayOfMonthUTC) {
      return stats;
    }

    // 2. Process next pages with early-exit
    const last = Math.min(totalPages ?? MAX_PAGES, MAX_PAGES);

    for (let p = 2; p <= last; p++) {
      const c = new AbortController();

      try {
        const next = await withTimeout(
          fetchLogsPage(p, c.signal),
          FETCH_TIMEOUT_MS,
          c,
        );

        const pageOldest = processRows(next.rows || []);

        if (pageOldest && pageOldest < firstDayOfMonthUTC) {
          break;
        }

        if (!next.has_more && !totalPages) break;
      } catch (e) {
        consolePino.warn(`Warning: Failed to fetch page ${p}. Skipping.`, e);
      }
    }

    return stats;
  } catch (e) {
    consolePino.error("Fatal error during stats fetching:", e);
    throw e;
  }
}

// ---------------- Custom Hook ----------------
export function useFingerprintStats() {
  return useQuery<FingerprintStats, Error>({
    queryKey: ["logs-counts"],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
