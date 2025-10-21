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
} from "@heroui/react";
import { Search, Upload, Download, Users, FileText, Fingerprint } from "lucide-react";
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

async function fetchLogsFromApi(page: number, signal?: AbortSignal): Promise<LogsResponse> {
  const offset = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));

  const url = `http://188.245.70.138:8080/api/logs?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": "gsi-attendance-key",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

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
    has_more: typeof json.has_more === "boolean" ? json.has_more : rows.length === PAGE_SIZE,
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

function mapType(t?: number) {
  if (t === 0) return "Masuk";
  if (t === 1) return "Pulang";
  if (t === 4) return "Lembur Masuk";
  if (t === 5) return "Lembur Pulang";
  return String(t ?? "-");
}

export default function Page() {
  const [rows, setRows] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        setHasMore(res.has_more ?? (res.rows.length === PAGE_SIZE));
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

  // filter client-side by user_id or device_sn quickly (UI similarity)
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        String(r.user_id ?? "").toLowerCase().includes(q) ||
        String(r.device_sn ?? "").toLowerCase().includes(q) ||
        String(r.id ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, searchQuery]);

  const totalPages = typeof total === "number" ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null;

  const handleExport = useCallback(() => {
    const exportData = (filteredRows.length ? filteredRows : rows).map((r, i) => ({
      No: (page - 1) * PAGE_SIZE + i + 1,
      id: r.id,
      user_id: r.user_id,
      type: mapType(r.type),
      device_sn: r.device_sn,
      timestamp: formatDate(r.timestamp ?? r.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [{ wch: 6 }, { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "logs");
    const ts = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    XLSX.writeFile(wb, `fingerprint_logs_${ts}.xlsx`);
  }, [rows, filteredRows, page]);

  // pages used by HeroUI Pagination when totalPages known
  const pages = totalPages ?? Math.max(1, page);

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-green-800 rounded-lg flex-shrink-0">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-semibold text-default-800">Fingerprint</h2>
                <Chip
                  className="text-sm font-bold"
                  color="success"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  {typeof total === 'number' ? total : 0}
                </Chip>
              </div>

              <p className="text-xs sm:text-small text-default-600">
                Display fingerprint logs
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Find ID or User ID ..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              variant="flat"
              value={searchQuery}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.target.style.outline = "none"; }}
              onValueChange={(v: string) => { setSearchQuery(v); setPage(1); }}
            />

            <Button className="flex-1 sm:flex-none" color="warning" size="sm" startContent={<Upload className="w-4 h-4" />} variant="flat" onPress={handleExport}>
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
              placeholder="Cari ID, user_id atau device..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              variant="flat"
              value={searchQuery}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.target.style.outline = "none"; }}
              onValueChange={(v: string) => { setSearchQuery(v); setPage(1); }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table
              aria-label="Fingerprint logs table"
              className="min-w-full"
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
            >
              <TableHeader>
                {/* header styling like UserTable: small uppercase, tight spacing */}
                <TableColumn className="w-12 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">NO</TableColumn>
                <TableColumn className="w-20 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">ID</TableColumn>
                <TableColumn className="w-24 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">USER ID</TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">TYPE</TableColumn>
                <TableColumn className="w-56 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">DEVICE SN</TableColumn>
                <TableColumn className="w-48 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">TIME</TableColumn>
              </TableHeader>

              <TableBody>
                {filteredRows.map((item: LogEntry, index: number) => {
                  const idx = (page - 1) * PAGE_SIZE + index + 1;
                  return (
                    <TableRow key={item.id ?? idx} className="hover:bg-default-50">
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">{idx}</TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm font-semibold text-default-800">{item.id}</TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">{item.user_id ?? "-"}</TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 whitespace-pre-line">{mapType(item.type)}</TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 truncate">{item.device_sn ?? "-"}</TableCell>
                      <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">{formatDate(item.timestamp ?? item.created_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

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
          {totalPages ? ` — Halaman ${page} dari ${totalPages}` : ` — Halaman ${page}`}
        </div>
      </div>

      {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}
    </div>
  );
}