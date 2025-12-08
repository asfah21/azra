// app/api/fingerprint/table/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // ← jwt from middleware.ts
import { getUsers } from "@/actions/users";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

async function fetchBackend(limit: number, offset: number) {
  const url = new URL(BACKEND_URL);

  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url, {
    headers: { "X-API-Key": API_KEY, Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Upstream error ${res.status}`);

  const json = await res.json().catch(() => ({}));

  const rows =
    json?.rows || json?.data || (Array.isArray(json) ? json : []) || [];

  const total =
    json?.total ??
    json?.count ??
    json?.total_rows ??
    (rows[0]?.total_rows || null);

  return {
    rows: Array.isArray(rows) ? rows : [],
    total: Number(total) || null,
  };
}

export async function GET(req: NextRequest) {
  // JWT PROTECTION — hanya user login yang boleh akses
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- kode asli tetap utuh ---
  const inUrl = new URL(req.url);

  const page = Math.max(Number(inUrl.searchParams.get("page") || 1), 1);
  const search = (inUrl.searchParams.get("search") || "").trim().toLowerCase();
  const join = (inUrl.searchParams.get("join") || "").toLowerCase();

  const pageSize = 20;

  let rows: any[] = [];
  let total: number | null = null;

  // FETCH DATA
  if (search) {
    const batch = 500;
    let offset = 0;

    const first = await fetchBackend(batch, offset);

    rows = [...first.rows];
    total = first.total;

    const totalPages = Math.ceil((total || first.rows.length) / batch);

    for (let p = 2; p <= totalPages; p++) {
      offset = (p - 1) * batch;
      const next = await fetchBackend(batch, offset);

      rows.push(...next.rows);

      if (next.rows.length < batch) break;
    }
  } else {
    const offset = (page - 1) * pageSize;
    const data = await fetchBackend(pageSize, offset);

    rows = data.rows;
    total = data.total;
  }

  // JOIN USERS
  if (join === "user") {
    try {
      const users = await getUsers();

      // console.log("[fingerprint/table] Users fetched:", users.length);
      // if (users.length > 0) {
      //   console.log("[fingerprint/table] First user sample:", users[0]);
      // }

      const userMap: Record<string, any> = {};

      for (const u of users) {
        if (!u?.fid) {
          // console.warn("[fingerprint/table] User missing fid:", u);
          continue;
        }
        const key = String(u.fid).trim();

        userMap[key] = {
          fid: key,
          name: u.name || "",
          nik: u.nik || "",
          department: u.department || "",
          photo: u.photo || "",
        };
      }

      // console.log(
      //   "[fingerprint/table] UserMap keys:",
      //   Object.keys(userMap).slice(0, 5),
      // );

      rows = rows.map((r) => {
        const fid = r.user_id || r.fid || r.userId || r.uid || null;
        const key = fid !== null ? String(fid).trim() : null;

        // if (key && !userMap[key]) {
        //   console.warn(
        //     "[fingerprint/table] User not found for fid:",
        //     key,
        //     "available keys:",
        //     Object.keys(userMap).slice(0, 5),
        //   );
        // }

        return { ...r, user: key ? userMap[key] || null : null };
      });

      // console.log(
      //   "[fingerprint/table] After join, first row user:",
      //   rows[0]?.user,
      // );
    } catch (err) {
      console.error("[fingerprint/table] Error joining users:", err);
    }
  }

  // LOCAL SEARCH FILTERING
  if (search) {
    rows = rows.filter((r) => {
      const u = r.user || {};

      return (
        String(r.device_sn || "")
          .toLowerCase()
          .includes(search) ||
        String(r.user_id || "")
          .toLowerCase()
          .includes(search) ||
        String(u.name || "")
          .toLowerCase()
          .includes(search) ||
        String(u.nik || "")
          .toLowerCase()
          .includes(search) ||
        String(u.department || "")
          .toLowerCase()
          .includes(search) ||
        String(u.fid || "")
          .toLowerCase()
          .includes(search)
      );
    });

    total = rows.length;
  }

  const start = (page - 1) * pageSize;
  const paginated = search ? rows.slice(start, start + pageSize) : rows;

  return NextResponse.json(
    { rows: paginated, total, pageSize },
    { status: 200 },
  );
}
