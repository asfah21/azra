"use client";

import { CardGridSkeleton, TableFingerprint, TableSkeleton } from "@/components/ui/skeleton";
import { Fingerprint, User } from "lucide-react";
import DashboardFooter from "../components/DashboardFooter";
import FingerTable from "./components/FingerTable";
import FingerCardGrids from "./components/CardGrid";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Tambah helper & tipe
type LogEntry = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
};

const PAGE_SIZE = 200;

function toYMDUTC(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function ymdFromRowUTC(row: LogEntry): string | null {
  const raw = row.timestamp ?? row.created_at;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return toYMDUTC(d);
}

async function fetchLogsPage(page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));

  const url = `http://188.245.70.138:8080/api/logs?${params.toString()}`;
  const res = await axios.get(url, {
    headers: {
      "X-API-Key": "gsi-attendance-key",
      "Content-Type": "application/json",
    },
  });
  // Asumsi response shape: { rows, total, has_more }
  return res.data as { rows: LogEntry[]; total?: number; has_more?: boolean };
}

export default function ClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["logs-counts"],
    queryFn: async () => {
      // Hitung counts type 0/1 untuk hari ini dan bulan ini
      const now = new Date();
      const todayYMD = toYMDUTC(now);
      const monthYear = { y: now.getUTCFullYear(), m: now.getUTCMonth() }; // 0-based

      let type0Today = 0;
      let type1Today = 0;
      let type0ThisMonth = 0;
      let type1ThisMonth = 0;

      // Fetch halaman pertama untuk tahu total
      const first = await fetchLogsPage(1);
      const total = typeof first.total === "number" ? first.total : undefined;
      const totalPages = total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : undefined;

      const consume = (rows: LogEntry[]) => {
        for (const r of rows) {
          const ymd = ymdFromRowUTC(r);
          if (!ymd) continue;

          // Today
          if (ymd === todayYMD) {
            if (r.type === 0) type0Today++;
            else if (r.type === 1) type1Today++;
          }

          // This month
          const d = new Date(r.timestamp ?? r.created_at ?? "");
          if (!Number.isNaN(d.getTime())) {
            const sameMonth =
              d.getUTCFullYear() === monthYear.y && d.getUTCMonth() === monthYear.m;
            if (sameMonth) {
              if (r.type === 0) type0ThisMonth++;
              else if (r.type === 1) type1ThisMonth++;
            }
          }
        }
      };

      consume(first.rows ?? []);

      // Lanjutkan sisa halaman
      if (first.has_more || (totalPages && totalPages > 1)) {
        const lastPage = totalPages ?? 200; // batas aman jika API tidak kirim total
        for (let p = 2; p <= lastPage; p++) {
          const pageData = await fetchLogsPage(p);
          consume(pageData.rows ?? []);
          if (!pageData.has_more && !totalPages) break;
          if (!pageData.has_more && totalPages) {
            // tetap lanjut sampai p == totalPages
            continue;
          }
        }
      }

      return {
        data: {
          // opsional kirim juga total jika perlu
          stats: {
            type0Today,
            type1Today,
            type0ThisMonth,
            type1ThisMonth,
          },
        },
      };
    },
    refetchInterval: 5000,
  });

  // Ambil stats yang baru
  const userStats =
    data?.data?.stats ?? {
      type0Today: 0,
      type1Today: 0,
      type0ThisMonth: 0,
      type1ThisMonth: 0,
    };

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Fingerprint className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Fingerprint
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <FingerCardGrids stats={userStats} />
        </div>
      )}

      {isLoading ? (
        <TableFingerprint />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data.
        </div>
      ) : (
        <FingerTable />
      )}

      <DashboardFooter className="mt-10 mb-[-10px] md:mb-[-30px]" />
    </div>
  );
}