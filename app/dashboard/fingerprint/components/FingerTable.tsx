"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Search, Upload, UserRoundCheck } from "lucide-react";
import * as XLSX from "xlsx";

type LogEntry = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
  total_rows?: number;
  [key: string]: any;
};

type LogsResponse = {
  total?: number | null;
  rows: LogEntry[];
  limit?: number;
  offset?: number;
  has_more?: boolean;
};

const PAGE_SIZE = 20;

async function fetchLogsFromApi(
  page: number,
  signal?: AbortSignal,
): Promise<LogsResponse> {
  const offset = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams();

  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));

  // ✅ Fetch ke endpoint internal Next.js, bukan IP publik
  const url = `/api/fingerprint/table?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    signal,
  });


// const PAGE_SIZE = 20;

// async function fetchLogsFromApi(
//   page: number,
//   signal?: AbortSignal,
// ): Promise<LogsResponse> {
//   const offset = (page - 1) * PAGE_SIZE;
//   const params = new URLSearchParams();

//   params.set("limit", String(PAGE_SIZE));
//   params.set("offset", String(offset));

//   const url = `http://188.245.70.138:8080/api/logs?${params.toString()}`;

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "X-API-Key": "gsi-attendance-key",
//       "Content-Type": "application/json",
//     },
//     cache: "no-store",
//     signal,
//   });

   if (!res.ok) {
     const text = await res.text();

     throw new Error(`Fetch error (${res.status}): ${text}`);
  }

  const json = await res.json();

  let rows: LogEntry[] = [];

  if (json && Array.isArray(json.rows)) rows = json.rows;
  else if (json && Array.isArray(json.data)) rows = json.data;
  else if (Array.isArray(json)) rows = json;
  else rows = [];

  let total: number | null | undefined = undefined;

  if (typeof json.total === "number") total = json.total;
  else if (typeof json.count === "number") total = json.count;
  else if (rows[0]?.total_rows) total = Number(rows[0].total_rows);
  else if (typeof json.total_rows === "number") total = json.total_rows;
  else if (typeof json.total_rows === "string") total = Number(json.total_rows);

  if (typeof json.has_more === "boolean" && json.has_more === false) {
    total = (offset || 0) + rows.length;
  }

  return {
    rows,
    total: typeof total === "number" ? total : null,
    limit: Number(json.limit ?? PAGE_SIZE),
    offset: Number(json.offset ?? offset),
    has_more:
      typeof json.has_more === "boolean"
        ? json.has_more
        : rows.length === PAGE_SIZE,
  };
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(iso)) return iso;
  const d = new Date(String(iso));

  if (isNaN(d.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
// Tambahkan helper split date/time berbasis formatDate agar konsisten
function splitDateTime(iso?: string) {
  const full = formatDate(iso);

  if (!full || full === "-") return { date: "-", time: "-" };
  const [date, time] = full.split(" ");

  return { date: date ?? "-", time: time ?? "-" };
}

function mapType(t?: number) {
  if (t === 0) return "Masuk";
  if (t === 1) return "Pulang";
  if (t === 4) return "Lembur Masuk";
  if (t === 5) return "Lembur Pulang";

  return String(t ?? "-");
}

export default function FingerTable() {
  const [rows, setRows] = useState<LogEntry[]>([]);
  const [usersByFid, setUsersByFid] = useState<Record<string, string>>({});
  const [usersDeptByFid, setUsersDeptByFid] = useState<Record<string, string>>(
    {},
  );
  const [usersNikByFid, setUsersNikByFid] = useState<Record<string, string>>(
    {},
  );
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    isOpen: isExportOpen,
    onOpen: onOpenExport,
    onOpenChange: onExportOpenChange,
  } = useDisclosure();
  const [exporting, setExporting] = useState(false);
  const [exportingWhich, setExportingWhich] = useState<
    "current" | "today" | "yesterday" | "sevenDaysAgo" | "all" | null
  >(null);
  const [exportProgress, setExportProgress] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLogsFromApi(page, controller.signal);

        if (!mounted) return;
        setRows(res.rows ?? []);
        setHasMore(res.has_more ?? res.rows.length === PAGE_SIZE);
        setTotal(typeof res.total === "number" ? res.total : null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [page]);

  // load users once and build map by fid -> name & department
  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        const res = await fetch("/api/dashboard/users", { cache: "no-store" });

        if (!res.ok) return;

        const json = await res.json();
        const usersList: any[] =
          json?.data?.users ?? json?.users ?? (Array.isArray(json) ? json : []);

        const nameMap: Record<string, string> = {};
        const deptMap: Record<string, string> = {};
        const nikMap: Record<string, string> = {};

        for (const u of usersList) {
          if (u?.fid != null) {
            const key = String(u.fid);

            nameMap[key] = u.name ?? u?.fullName ?? u?.username ?? "";
            deptMap[key] = u?.department ?? "";
            nikMap[key] = u?.nik != null ? String(u.nik) : "";
          }
        }
        if (mounted) {
          setUsersByFid(nameMap);
          setUsersDeptByFid(deptMap);
          setUsersNikByFid(nikMap);
        }
      } catch {}
    }
    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  // filter client-side by user_id or device_sn quickly (UI similarity)
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((r) => {
      return (
        String(r.user_id ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.device_sn ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.id ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [rows, searchQuery]);

  // Helper untuk resolve nama dari user_id (fid)
  const resolveNameByUserId = useCallback(
    (userId?: string | number) => {
      if (userId == null) return "-";

      return usersByFid[String(userId)] ?? String(userId);
    },
    [usersByFid],
  );

  // Helper untuk resolve NIK dari user_id (fid)
  const resolveNikByUserId = useCallback(
    (userId?: string | number) => {
      if (userId == null) return "-";

      return usersNikByFid[String(userId)] ?? "-";
    },
    [usersNikByFid],
  );

  // Helper untuk resolve Department dari user_id (fid)
  const resolveDeptByUserId = useCallback(
    (userId?: string | number) => {
      if (userId == null) return "-";

      return usersDeptByFid[String(userId)] ?? "-";
    },
    [usersDeptByFid],
  );

  const totalPages =
    typeof total === "number"
      ? Math.max(1, Math.ceil(total / PAGE_SIZE))
      : null;

  // util: bangun data export dan tulis ke XLSX
  const exportToXlsx = useCallback(
    (source: LogEntry[], filenameSuffix: string) => {
      const exportData = source.map((r, i) => {
        const { date, time } = splitDateTime(r.timestamp ?? r.created_at);
        const name = resolveNameByUserId(r.user_id);
        const nik = resolveNikByUserId(r.user_id);
        const department = resolveDeptByUserId(r.user_id);

        return {
          No: i + 1,
          name,
          nik,
          department,
          user_id: r.user_id ?? "-",
          type: mapType(r.type),
          date,
          time,
          device_sn: r.device_sn ?? "-",
        };
      });
      const ws = XLSX.utils.json_to_sheet(exportData, {
        header: [
          "No",
          "name",
          "nik",
          "department",
          "user_id",
          "type",
          "date",
          "time",
          "device_sn",
        ],
      });

      ws["!cols"] = [
        { wch: 6 },
        { wch: 24 },
        { wch: 14 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 10 },
        { wch: 18 },
      ];
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "logs");
      const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

      XLSX.writeFile(wb, `fingerprint_logs_${filenameSuffix}_${ts}.xlsx`);
    },
    [resolveNameByUserId, resolveNikByUserId, resolveDeptByUserId],
  );

  // export: halaman saat ini (sesuai perilaku lama)
  const handleExportCurrent = useCallback(async () => {
    setExporting(true);
    setExportingWhich("current");
    setExportProgress(0);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      const source = filteredRows.length ? filteredRows : rows;

      // simulasi progres singkat (data sudah ada di client)
      setExportProgress(40);
      await sleep(50);
      setExportProgress(75);
      exportToXlsx(source, "current_page");
      setExportProgress(100);
    } finally {
      setExporting(false);
      setExportingWhich(null);
    }
  }, [filteredRows, rows, exportToXlsx]);

  // Fetch semua halaman dengan progress callback
  const fetchAllLogs = useCallback(
    async (
      onProgress?: (info: {
        pagesDone: number;
        totalPages?: number | null;
        rowsLoaded: number;
      }) => void,
    ): Promise<LogEntry[]> => {
      let all: LogEntry[] = [];
      // fetch halaman 1 dulu supaya tahu total
      let p = 1;
      const first = await fetchLogsFromApi(1);

      all = all.concat(first.rows ?? []);
      const totalPages =
        typeof first.total === "number"
          ? Math.max(1, Math.ceil(first.total / PAGE_SIZE))
          : null;

      onProgress?.({ pagesDone: 1, totalPages, rowsLoaded: all.length });

      let hasMore = !!first.has_more;

      // lanjutkan ke halaman berikutnya
      while (hasMore && (totalPages ? p < totalPages : p < 200)) {
        p += 1;
        const res = await fetchLogsFromApi(p);

        all = all.concat(res.rows ?? []);
        hasMore = !!res.has_more;
        const totalPg =
          typeof res.total === "number"
            ? Math.max(1, Math.ceil(res.total / PAGE_SIZE))
            : totalPages;

        onProgress?.({
          pagesDone: p,
          totalPages: totalPg,
          rowsLoaded: all.length,
        });
        if (!hasMore) break;
      }

      return all;
    },
    [],
  );

  // export: semua data "hari ini" (UTC, konsisten dengan formatDate)
  const handleExportToday = useCallback(async () => {
    setExporting(true);
    setExportingWhich("today");
    setExportProgress(0);
    try {
      const all = await fetchAllLogs((info) => {
        // hitung persen berdasarkan halaman yang selesai
        const tp = info.totalPages ?? null;
        const pct =
          tp && tp > 0
            ? Math.min(95, Math.round((info.pagesDone / tp) * 90))
            : Math.min(90, info.pagesDone * 5);

        setExportProgress(pct);
      });
      const pad = (n: number) => String(n).padStart(2, "0");
      const now = new Date();
      const todayUTC = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
      const todayRows = all.filter((r) => {
        const { date } = splitDateTime(r.timestamp ?? r.created_at);

        return date === todayUTC;
      });

      setExportProgress((p) => Math.max(p, 97));
      exportToXlsx(todayRows, "today");
      setExportProgress(100);
    } finally {
      setExporting(false);
      setExportingWhich(null);
    }
  }, [fetchAllLogs, exportToXlsx]);

  // export: kemarin s/d hari ini (UTC, 2 hari termasuk hari ini)
  const handleExportYesterday = useCallback(async () => {
    setExporting(true);
    setExportingWhich("yesterday");
    setExportProgress(0);
    try {
      const all = await fetchAllLogs((info) => {
        const tp = info.totalPages ?? null;
        const pct =
          tp && tp > 0
            ? Math.min(95, Math.round((info.pagesDone / tp) * 90))
            : Math.min(90, info.pagesDone * 5);

        setExportProgress(pct);
      });

      const pad = (n: number) => String(n).padStart(2, "0");
      const now = new Date();
      const todayUTC = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(
        now.getUTCDate(),
      )}`;
      const y = new Date(now);

      y.setUTCDate(y.getUTCDate() - 1);
      const yesterdayUTC = `${y.getUTCFullYear()}-${pad(y.getUTCMonth() + 1)}-${pad(
        y.getUTCDate(),
      )}`;

      const allow = new Set<string>([yesterdayUTC, todayUTC]);
      const rows = all.filter((r) =>
        allow.has(splitDateTime(r.timestamp ?? r.created_at).date),
      );

      setExportProgress((p) => Math.max(p, 97));
      exportToXlsx(rows, "yesterday_to_today");
      setExportProgress(100);
    } finally {
      setExporting(false);
      setExportingWhich(null);
    }
  }, [fetchAllLogs, exportToXlsx]);

  // export: 7 hari terakhir (UTC) — termasuk hari ini sampai H-6
  const handleExport7DaysAgo = useCallback(async () => {
    setExporting(true);
    setExportingWhich("sevenDaysAgo");
    setExportProgress(0);
    try {
      const all = await fetchAllLogs((info) => {
        const tp = info.totalPages ?? null;
        const pct =
          tp && tp > 0
            ? Math.min(95, Math.round((info.pagesDone / tp) * 90))
            : Math.min(90, info.pagesDone * 5);

        setExportProgress(pct);
      });

      const pad = (n: number) => String(n).padStart(2, "0");
      const today = new Date();
      // Kumpulkan string tanggal UTC untuk 7 hari terakhir: [today, today-1, ..., today-6]
      const last7Days = new Set<string>();

      for (let i = 0; i < 7; i++) {
        const d = new Date(today);

        d.setUTCDate(d.getUTCDate() - i);
        const s = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
          d.getUTCDate(),
        )}`;

        last7Days.add(s);
      }
      // Filter baris
      const rows = all.filter((r) => {
        const { date } = splitDateTime(r.timestamp ?? r.created_at);

        return last7Days.has(date);
      });

      setExportProgress((p) => Math.max(p, 97));
      exportToXlsx(rows, "last_7_days");
      setExportProgress(100);
    } finally {
      setExporting(false);
      setExportingWhich(null);
    }
  }, [fetchAllLogs, exportToXlsx]);

  // export: semua data (semua halaman)
  const handleExportAll = useCallback(async () => {
    setExporting(true);
    setExportingWhich("all");
    setExportProgress(0);
    try {
      const all = await fetchAllLogs((info) => {
        const tp = info.totalPages ?? null;
        const pct =
          tp && tp > 0
            ? Math.min(95, Math.round((info.pagesDone / tp) * 90))
            : Math.min(90, info.pagesDone * 5);

        setExportProgress(pct);
      });

      setExportProgress((p) => Math.max(p, 97));
      exportToXlsx(all, "all");
      setExportProgress(100);
    } finally {
      setExporting(false);
      setExportingWhich(null);
    }
  }, [fetchAllLogs, exportToXlsx]);

  const pages = totalPages ?? Math.max(1, page);

  return (
    // <div className="p-0 md:p-6">
    <div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-green-800 rounded-lg flex-shrink-0">
              <UserRoundCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-semibold text-default-800">
                  Attendance
                </h2>
                <Chip
                  className="text-sm font-bold"
                  color="success"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  {typeof total === "number" ? total : 0}
                </Chip>
              </div>

              <p className="text-xs sm:text-small text-default-600">
                Attendance by fingerprint
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Find by User ID ..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={(v: string) => {
                setSearchQuery(v);
                setPage(1);
              }}
            />

            <Button
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<Upload className="w-4 h-4" />}
              variant="flat"
              onPress={onOpenExport}
            >
              Export
            </Button>

            {/* <Button className="flex-1 sm:flex-none" color="primary" size="sm" startContent={<Download className="w-4 h-4" />} variant="flat" onPress={() => {  }}>
              Import
            </Button> */}
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="px-0">
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Find by User ID ..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={(v: string) => {
                setSearchQuery(v);
                setPage(1);
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table
              aria-label="Fingerprint logs table"
              bottomContent={
                <div className="flex w-full justify-center py-3">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={(p: number) => setPage(p)}
                  />
                </div>
              }
              className="min-w-full"
            >
              <TableHeader>
                {/* header styling like UserTable: small uppercase, tight spacing */}
                <TableColumn className="w-12 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  NO
                </TableColumn>
                {/* <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  NIK
                </TableColumn> */}
                <TableColumn className="w-20 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  NAME
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DIVISION
                </TableColumn>
                <TableColumn className="w-24 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  USER ID
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  TYPE
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DATE
                </TableColumn>
                <TableColumn className="w-24 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  TIME
                </TableColumn>
                <TableColumn className="w-56 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DEVICE SN
                </TableColumn>
              </TableHeader>

              <TableBody>
                {filteredRows.map((item: LogEntry, index: number) => {
                  const idx = (page - 1) * PAGE_SIZE + index + 1;
                  const resolvedName =
                    item.user_id != null
                      ? (usersByFid[String(item.user_id)] ??
                        String(item.user_id))
                      : "-";
                  const resolvedDept =
                    item.user_id != null
                      ? (usersDeptByFid[String(item.user_id)] ?? "-")
                      : "-";
                  const resolvedNik =
                    item.user_id != null
                      ? (usersNikByFid[String(item.user_id)] ?? "-")
                      : "-";
                  const { date: resolvedDate, time: resolvedTime } =
                    splitDateTime(item.timestamp ?? item.created_at);

                  return (
                    <TableRow
                      key={item.id ?? idx}
                      className="hover:bg-default-50"
                    >
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                        {idx}
                      </TableCell>
                      {/* resolved user name (lookup by fid) */}
                      <TableCell className="text-center align-middle px-6 py-3 text-sm font-semibold text-default-800">
                        <div className="text-small align-left">
                          <p className="font-medium truncate">{resolvedName}</p>
                          <p className="text-xs text-default-500 mt-0.5">
                            {resolvedNik || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                        {resolvedDept || "-"}
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                        {item.user_id ?? "-"}
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 whitespace-pre-line">
                        <Chip
                          className="mx-auto"
                          color={
                            item.type === 0
                              ? "success"
                              : item.type === 1
                                ? "danger"
                                : item.type === 4
                                  ? "primary"
                                  : item.type === 5
                                    ? "warning"
                                    : "default"
                          }
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          {mapType(item.type)}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 truncate">
                        <div className="truncate">{resolvedDate}</div>
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                        {resolvedTime}
                      </TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 truncate">
                        {item.device_sn ?? "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Export options modal */}
      <Modal isOpen={isExportOpen} onOpenChange={onExportOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base flex items-center gap-2">
                Export data
                {exporting ? (
                  <span className="ml-2 text-green-500 text-xs flex items-center gap-1">
                    {/* <Spinner size="sm" /> */}
                    Processing.. {exportProgress}%
                  </span>
                ) : null}
              </ModalHeader>
              <ModalBody className="gap-2">
                {/* <Button
                  color="warning"
                  variant="flat"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "current"}
                  onPress={async () => {
                    await handleExportCurrent();
                    onClose();
                  }}
                >
                  Export current
                </Button> */}
                <Button
                  color="primary"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "today"}
                  variant="flat"
                  onPress={async () => {
                    await handleExportToday();
                    onClose();
                  }}
                >
                  Export today
                </Button>
                <Button
                  color="secondary"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "yesterday"}
                  variant="flat"
                  onPress={async () => {
                    await handleExportYesterday();
                    onClose();
                  }}
                >
                  Export yesterday
                </Button>
                <Button
                  color="warning"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "sevenDaysAgo"}
                  variant="flat"
                  onPress={async () => {
                    await handleExport7DaysAgo();
                    onClose();
                  }}
                >
                  Export last 7 days
                </Button>
                <Button
                  color="success"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "all"}
                  variant="flat"
                  onPress={async () => {
                    await handleExportAll();
                    onClose();
                  }}
                >
                  Export all data
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={exporting} variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="mt-4 flex items-center justify-between">
        {/* {totalPages ? (
          <Pagination isCompact showControls showShadow color="primary" page={page} total={pages} onChange={(p: number) => setPage(p)} />
        ) : (
          // keep small fallback controls if total unknown
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="light" onPress={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}>Prev</Button>
            <div className="text-sm text-default-600 px-3">Hal {page}</div>
            <Button size="sm" variant="light" onPress={() => setPage((s) => s + 1)} disabled={!hasMore}>Next</Button>
          </div>
        )} */}

        <div className="text-sm text-gray-500">
          Total: {total ?? (rows.length > 0 ? "?" : 0)}
          {totalPages
            ? ` — Halaman ${page} dari ${totalPages}`
            : ` — Halaman ${page}`}
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}
    </div>
  );
}
