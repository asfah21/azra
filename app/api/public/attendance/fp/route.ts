import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Types
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

interface LogsResponse {
  total?: number | null;
  rows: LogEntry[];
  limit?: number;
  offset?: number;
  has_more?: boolean;
}

const FETCH_SIZE = 500; // batch size of upstream table API
const UI_DEFAULT_LIMIT = 20;
const MAX_LIMIT = 500;

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;

  return Math.max(min, Math.min(max, n));
}

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Cache-Control": "no-store",
  });
}

// ==>Inline API key protection
const API_KEY = "gsi-3f2504e0-4f89-11d3-9a0c-0305b230491-azra"; // ganti dengan key Anda

// Add: inline service key for internal users API
// const USERS_SERVICE_KEY_INLINE = "azra_users_service_key_inline"; // ganti dengan key Anda
function extractApiKeyInline(req: NextRequest, url: URL): string {
  const h = req.headers.get("x-api-key");

  if (h && h.trim()) return h.trim();
  const qp = url.searchParams.get("api_key");

  return qp ? qp.trim() : "";
}

// NEW: forward auth headers (cookies/bearer) so internal APIs return full user data
function buildForwardHeaders(req: NextRequest): Headers {
  const h = new Headers();
  const cookie = req.headers.get("cookie");

  if (cookie) h.set("cookie", cookie);
  const auth = req.headers.get("authorization");

  if (auth) h.set("authorization", auth);

  return h;
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

// NEW: helpers to enrich name/nik/department/photo from either users map or row fields
function pickFirstField(obj: any, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];

    if (v != null) {
      const s = String(v).trim();

      if (s) return s;
    }
  }

  return "";
}

function enrichPersonFields(
  r: any,
  maps: {
    nameMap: Record<string, string>;
    nikMap: Record<string, string>;
    deptMap: Record<string, string>;
    photoMap: Record<string, string>;
  },
) {
  const uidKey = r?.user_id != null ? String(r.user_id) : undefined;
  const nameFromMap = uidKey ? maps.nameMap[uidKey] : "";
  const nikFromMap = uidKey ? maps.nikMap[uidKey] : "";
  const deptFromMap = uidKey ? maps.deptMap[uidKey] : "";
  const photoFromMap = uidKey ? maps.photoMap[uidKey] : "";

  const name =
    nameFromMap ||
    pickFirstField(r, [
      "name",
      "fullName",
      "full_name",
      "username",
      "user_name",
      "employee_name",
      "employeeName",
      "nama",
      "nama_lengkap",
    ]);

  const nik =
    nikFromMap ||
    pickFirstField(r, [
      "nik",
      "NIK",
      "employee_nik",
      "employeeNik",
      "no_induk",
      "noInduk",
      "id_number",
      "idNumber",
    ]);

  const department =
    deptFromMap ||
    pickFirstField(r, ["department", "dept", "division", "bagian", "unit"]);

  const photo =
    photoFromMap ||
    pickFirstField(r, [
      "photo",
      "avatar",
      "avatarUrl",
      "profileImageUrl",
      "image",
      "profile_photo_url",
    ]);

  return {
    name: name || "-",
    nik: nik || "-",
    department: department || "-",
    photo: photo || "",
  };
}

async function fetchUsers(baseUrl: string, headers?: HeadersInit) {
  // Ambil langsung dari DB agar tidak butuh session/cookie
  const usersList = await prisma.user.findMany({
    select: {
      fid: true,
      name: true,
      department: true,
      nik: true,
      photo: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const nameMap: Record<string, string> = {};
  const deptMap: Record<string, string> = {};
  const nikMap: Record<string, string> = {};
  const photoMap: Record<string, string> = {};

  for (const u of usersList) {
    if (u?.fid != null) {
      const key = String(u.fid);

      nameMap[key] = u.name ?? "";
      deptMap[key] = u?.department ?? "";
      nikMap[key] = u?.nik != null ? String(u.nik) : "";
      const photoUrl = u?.photo ?? "";

      photoMap[key] = photoUrl ? String(photoUrl) : "";
    }
  }

  return { nameMap, deptMap, nikMap, photoMap };
}

async function fetchServerPage(
  baseUrl: string,
  serverPage: number,
  headers?: HeadersInit,
): Promise<LogsResponse> {
  const offset = (serverPage - 1) * FETCH_SIZE;
  const params = new URLSearchParams();

  params.set("limit", String(FETCH_SIZE));
  params.set("offset", String(offset));
  const res = await fetch(
    `${baseUrl}/api/fingerprint/table?${params.toString()}`,
    {
      cache: "no-store",
      headers,
    },
  );

  if (!res.ok) {
    const text = await res.text();

    throw new Error(`Upstream error (${res.status}): ${text}`);
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
    limit: Number(json.limit ?? FETCH_SIZE),
    offset: Number(json.offset ?? offset),
    has_more:
      typeof json.has_more === "boolean"
        ? json.has_more
        : rows.length === FETCH_SIZE,
  };
}

async function fetchAllLogs(
  baseUrl: string,
  onProgress?: (info: {
    pagesDone: number;
    totalPages?: number | null;
    rowsLoaded: number;
  }) => void,
  headers?: HeadersInit,
): Promise<LogEntry[]> {
  let all: LogEntry[] = [];
  let p = 1;
  const first = await fetchServerPage(baseUrl, 1, headers);

  all = all.concat(first.rows ?? []);
  const totalPages =
    typeof first.total === "number"
      ? Math.max(1, Math.ceil(first.total / FETCH_SIZE))
      : null;

  onProgress?.({ pagesDone: 1, totalPages, rowsLoaded: all.length });

  let hasMore = !!first.has_more;

  while (hasMore && (totalPages ? p < totalPages : p < 200)) {
    p += 1;
    const res = await fetchServerPage(baseUrl, p, headers);

    all = all.concat(res.rows ?? []);
    hasMore = !!res.has_more;
    const totalPg =
      typeof res.total === "number"
        ? Math.max(1, Math.ceil(res.total / FETCH_SIZE))
        : totalPages;

    onProgress?.({ pagesDone: p, totalPages: totalPg, rowsLoaded: all.length });
    if (!hasMore) break;
  }

  return all;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // ==> API key check (inline)
    const provided = extractApiKeyInline(req, url);

    if (provided !== API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized: invalid API key" },
        { status: 401, headers: corsHeaders() },
      );
    }

    const q = (params.get("q") || "").trim();

    const incomingLimit = Number(params.get("limit") ?? UI_DEFAULT_LIMIT);
    const limit = clamp(incomingLimit, 1, MAX_LIMIT);

    let page = Number(params.get("page") ?? "");
    const offsetParam = params.get("offset");

    if (!page && offsetParam != null) {
      const offset = Math.max(0, Number(offsetParam) || 0);

      page = Math.floor(offset / limit) + 1;
    }
    if (!page || !Number.isFinite(page) || page < 1) page = 1;

    const proto = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${proto}://${host}`;

    const forwardHeaders = buildForwardHeaders(req);

    const maps = await fetchUsers(baseUrl, forwardHeaders);

    let rowsOut: any[] = [];
    let total: number | null = null;

    if (q) {
      const qLower = q.toLowerCase();
      const all = await fetchAllLogs(baseUrl, undefined, forwardHeaders);
      const filtered = all.filter((r) => {
        const person = enrichPersonFields(r, maps);

        return (
          person.name.toLowerCase().includes(qLower) ||
          person.nik.toLowerCase().includes(qLower) ||
          person.department.toLowerCase().includes(qLower) ||
          String(r.user_id ?? "")
            .toLowerCase()
            .includes(qLower) ||
          String(r.device_sn ?? "")
            .toLowerCase()
            .includes(qLower) ||
          String(r.id ?? "")
            .toLowerCase()
            .includes(qLower)
        );
      });

      total = filtered.length;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      rowsOut = paged.map((r) => {
        const { date, time } = splitDateTime(r.timestamp ?? r.created_at);
        const person = enrichPersonFields(r, maps);

        return {
          //   user_id: r.user_id ?? "-",
          name: person.name,
          nik: person.nik,
          type_label: mapType(r.type),
          date,
          time,
          timestamp: r.timestamp ?? null,
        };
      });
    } else {
      const desiredServerPage =
        Math.floor(((page - 1) * limit) / FETCH_SIZE) + 1;
      const batch = await fetchServerPage(
        baseUrl,
        desiredServerPage,
        forwardHeaders,
      );

      total = typeof batch.total === "number" ? batch.total : null;

      const startInBatch =
        (page - 1) * limit - (desiredServerPage - 1) * FETCH_SIZE;
      const sliced = batch.rows.slice(
        Math.max(0, startInBatch),
        Math.max(0, startInBatch) + limit,
      );

      rowsOut = sliced.map((r) => {
        const { date, time } = splitDateTime(r.timestamp ?? r.created_at);
        const person = enrichPersonFields(r, maps);

        return {
          //   user_id: r.user_id ?? "-",
          name: person.name,
          nik: person.nik,
          type_label: mapType(r.type),
          date,
          time,
          timestamp: r.timestamp ?? null,
        };
      });
    }

    const totalPages =
      total != null ? Math.max(1, Math.ceil(total / limit)) : null;
    const body = {
      page,
      limit,
      total,
      totalPages,
      count: rowsOut.length,
      has_more:
        totalPages != null ? page < totalPages : rowsOut.length === limit,
      rows: rowsOut,
    };

    return NextResponse.json(body, { status: 200, headers: corsHeaders() });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

//tambahin API key, whitelist ip, dan tambah rate limiting
