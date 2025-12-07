"use client";

import { Fingerprint } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import DashboardFooter from "../components/DashboardFooter";

import FingerTable from "./components/FingerTable";
import FingerCardGrids from "./components/CardGrid";

import { CardGridSkeleton, TableFingerprint } from "@/components/ui/skeleton";

// ---------------- Types ----------------
type LogEntry = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
};

const PAGE_SIZE = 500;
const MAX_PAGES = 20; // safety cap for production
const FETCH_TIMEOUT_MS = 15000; // per request timeout

// ---------------- Helpers ----------------
const pad = (n: number) => String(n).padStart(2, "0");

function toYMDUTC(d: Date) {
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

// ---------------- API Fetcher ----------------
async function fetchLogsPage(page: number, signal?: AbortSignal) {
  const offset = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });

  const res = await fetch(`/api/fingerprint/card?${params.toString()}`, {
    method: "GET",
    headers: {
      "x-internal-key": process.env.NEXT_PUBLIC_INTERNAL_FP_API_KEY ?? "",
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.status}`);
  }

  return res.json() as Promise<{
    rows: LogEntry[];
    total?: number;
    has_more?: boolean;
  }>;
}

function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  controller: AbortController,
) {
  const t = setTimeout(() => controller.abort(), ms);

  return p.finally(() => clearTimeout(t));
}

// ---------------- Main Component ----------------
export default function ClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["logs-counts"],
    queryFn: async () => {
      const now = new Date();
      const todayYMD = toYMDUTC(now);

      let stats = {
        type0Today: 0,
        type1Today: 0,
        type0ThisMonth: 0,
        type1ThisMonth: 0,
      };

      const monthYear = {
        y: now.getUTCFullYear(),
        m: now.getUTCMonth(),
      };

      // First day of this month (UTC) as string for early-stop decision
      const firstDayOfMonthUTC = `${monthYear.y}-${pad(monthYear.m + 1)}-01`;

      // Fetch first page with timeout
      const c1 = new AbortController();
      const first = await withTimeout(
        fetchLogsPage(1, c1.signal),
        FETCH_TIMEOUT_MS,
        c1,
      );

      const totalPages = first.total
        ? Math.ceil((first.total as number) / PAGE_SIZE)
        : undefined;

      const processRows = (rows: LogEntry[]) => {
        let oldestYMD: string | null = null;

        for (const r of rows) {
          const ymd = ymdFromRowUTC(r);

          if (!ymd) continue;

          // track oldest (min) YMD in this batch for early stop
          if (!oldestYMD || ymd < oldestYMD) oldestYMD = ymd;

          const d = new Date(r.timestamp ?? r.created_at ?? "");

          if (Number.isNaN(d.getTime())) continue;

          // Today
          if (ymd === todayYMD) {
            r.type === 0 && stats.type0Today++;
            r.type === 1 && stats.type1Today++;
          }

          // This month
          const sameMonth =
            d.getUTCFullYear() === monthYear.y &&
            d.getUTCMonth() === monthYear.m;

          if (sameMonth) {
            r.type === 0 && stats.type0ThisMonth++;
            r.type === 1 && stats.type1ThisMonth++;
          }
        }

        return oldestYMD;
      };

      // Process first page
      let oldestSeen = processRows(first.rows || []);

      // Early stop if first page already older than this month
      if (oldestSeen && oldestSeen < firstDayOfMonthUTC) {
        return { stats };
      }

      // Process next pages with early-exit
      const last = Math.min(totalPages ?? MAX_PAGES, MAX_PAGES);

      for (let p = 2; p <= last; p++) {
        const c = new AbortController();
        const next = await withTimeout(
          fetchLogsPage(p, c.signal),
          FETCH_TIMEOUT_MS,
          c,
        );
        const pageOldest = processRows(next.rows || []);

        // If this page's oldest record is before the first day of month, break
        if (pageOldest && pageOldest < firstDayOfMonthUTC) {
          break;
        }

        // If upstream indicates no more pages, stop
        if (!next.has_more && !totalPages) break;
      }

      return { stats };
    },
    // refetchInterval: 5000,
  });

  const userStats = data?.stats ?? {
    type0Today: 0,
    type1Today: 0,
    type0ThisMonth: 0,
    type1ThisMonth: 0,
  };

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Fingerprint className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Fingerprint
          </h1>
        </div>
      </header>

      {/* Stats Cards */}
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat statistik.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <FingerCardGrids stats={userStats} />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <TableFingerprint />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data fingerprint.
        </div>
      ) : (
        <FingerTable />
      )}

      <DashboardFooter className="mt-10 mb-[-30px]" />
    </div>
  );
}
