export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

async function fetchBackendBatch(limit: number, offset: number) {
  const url = new URL(BACKEND_URL);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  const res = await fetch(url.toString(), { headers: { "X-API-Key": API_KEY, Accept: "application/json" }, cache: "no-store", keepalive: true });
  if (!res.ok) throw new Error(`Upstream error ${res.status}`);
  const json = await res.json().catch(() => ({}));
  const rows = Array.isArray(json?.rows) ? json.rows : Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  let total: number | null = null;
  if (typeof json?.total === "number") total = json.total;
  else if (typeof json?.count === "number") total = json.count;
  else if (typeof json?.total_rows === "number") total = json.total_rows;
  else if (typeof json?.total_rows === "string") total = Number(json.total_rows);
  else if ((rows as any)[0]?.total_rows) total = Number((rows as any)[0].total_rows);
  return { rows, total };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const range = String(body?.range || "today");
  const search = typeof body?.search === "string" ? body.search.trim() : "";
  const join = String(body?.join || "").toLowerCase();

  // Aggregate all logs
  const batchSize = 500;
  let offset = 0;
  const first = await fetchBackendBatch(batchSize, offset);
  let all = first.rows;
  const upstreamTotal = first.total;
  const totalPagesGuess = upstreamTotal != null ? Math.ceil(upstreamTotal / batchSize) : 5;
  for (let p = 2; p <= totalPagesGuess; p++) {
    offset = (p - 1) * batchSize;
    const next = await fetchBackendBatch(batchSize, offset);
    all = all.concat(next.rows);
    if (next.rows.length < batchSize) break;
  }

  // Join users if requested
  if (join === "user") {
    try {
      const cookie = req.headers.get("cookie") || "";
      const usersRes = await fetch(`${new URL(req.url).origin}/api/dashboard/users`, { cache: "no-store", headers: { Cookie: cookie, Accept: "application/json" } });
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        const usersList: any[] = usersJson?.data?.users ?? usersJson?.users ?? (Array.isArray(usersJson) ? usersJson : []);
        const nameMap: Record<string, string> = {};
        const deptMap: Record<string, string> = {};
        const nikMap: Record<string, string> = {};
        const photoMap: Record<string, string> = {};
        for (const u of usersList) {
          if (u?.fid != null) {
            const key = String(u.fid);
            nameMap[key] = u.name ?? u?.fullName ?? u?.username ?? "";
            deptMap[key] = u?.department ?? "";
            nikMap[key] = u?.nik != null ? String(u.nik) : "";
            const photoUrl = u?.photo ?? u?.avatar ?? u?.avatarUrl ?? u?.profileImageUrl ?? u?.image ?? u?.profile?.photoUrl ?? "";
            photoMap[key] = photoUrl ? String(photoUrl) : "";
          }
        }
        all = all.map((r: any) => {
          const rawFid = r?.user_id ?? r?.fid ?? r?.userId ?? r?.uid;
          const fidKey = rawFid != null ? String(rawFid) : undefined;
          const user = fidKey
            ? { fid: fidKey, name: nameMap[fidKey] ?? undefined, nik: nikMap[fidKey] ?? undefined, department: deptMap[fidKey] ?? undefined, photo: photoMap[fidKey] ?? undefined }
            : undefined;
          return { ...r, user };
        });
      }
    } catch {}
  }

  // Filter by range
  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();
  const todayUTC = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  const yesterdayUTC = `${y.getUTCFullYear()}-${pad(y.getUTCMonth() + 1)}-${pad(y.getUTCDate())}`;

  let filtered = all;
  if (range === "today") {
    filtered = all.filter((r: any) => String((r.timestamp || r.created_at || "")).includes(todayUTC));
  } else if (range === "yesterday") {
    const allow = new Set([todayUTC, yesterdayUTC]);
    filtered = all.filter((r: any) => allow.has(String((r.timestamp || r.created_at || "")).slice(0, 10)));
  } else if (range === "last7") {
    const allow = new Set<string>();
    for (let i = 0; i < 7; i++) { const d = new Date(now); d.setUTCDate(d.getUTCDate() - i); allow.add(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`); }
    filtered = all.filter((r: any) => allow.has(String((r.timestamp || r.created_at || "")).slice(0, 10)));
  } else if (range === "last30") {
    const allow = new Set<string>();
    for (let i = 0; i < 30; i++) { const d = new Date(now); d.setUTCDate(d.getUTCDate() - i); allow.add(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`); }
    filtered = all.filter((r: any) => allow.has(String((r.timestamp || r.created_at || "")).slice(0, 10)));
  }

  // Apply search on export
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((r: any) => {
      const user = r.user || {};
      return (
        String(user.name || "").toLowerCase().includes(q) ||
        String(user.nik || "").toLowerCase().includes(q) ||
        String(user.department || "").toLowerCase().includes(q) ||
        String(user.fid || "").toLowerCase().includes(q) ||
        String(r.user_id || "").toLowerCase().includes(q) ||
        String(r.device_sn || "").toLowerCase().includes(q)
      );
    });
  }

  // After range and optional search, apply final sort: department → name → timestamp desc
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

  const exportData = sorted.map((r: any, i: number) => {
    const ts = String(r.timestamp || r.created_at || "");
    const date = ts.slice(0, 10);
    const time = ts.slice(11, 19);
    const typeLabel = ((): string => {
      const t = Number(r.type);
      if (t === 0) return "Masuk";
      if (t === 1) return "Pulang";
      if (t === 4) return "Lembur Masuk";
      if (t === 5) return "Lembur Pulang";
      return "System";
    })();
    return {
      No: i + 1,
      name: r.user?.name ?? String(r.user_id ?? "-"),
      nik: r.user?.nik ?? "-",
      department: r.user?.department ?? "-",
      type: typeLabel,
      time,
      date,
      user_id: r.user?.fid ?? r.user_id ?? "-",
      device_sn: r.device_sn ?? "-",
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData, { header: ["No", "name", "nik", "department", "type", "time", "date", "user_id", "device_sn"] });
  ws["!cols"] = [{ wch: 6 }, { wch: 24 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "logs");
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const baseName = (() => {
    if (range === "today") return "fingerprint_today";
    if (range === "yesterday") return "fingerprint_yesterday";
    if (range === "last7") return "fingerprint_last_7_days";
    if (range === "last30") return "fingerprint_last_30_days";
    return "fingerprint_all";
  })();
  const filename = `${baseName}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;

  return new Response(new Uint8Array(arrayBuffer), { status: 200, headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename=${filename}`, "Cache-Control": "no-store" } });
}