// // app/api/logs/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
// const API_KEY = process.env.GSI_API_KEY || "gsi-attendance-key";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const limit = searchParams.get("limit") || "20";
//   const offset = searchParams.get("offset") || "0";

//   const url = `${BACKEND_URL}?limit=${limit}&offset=${offset}`;

//   const res = await fetch(url, {
//     headers: {
//       "X-API-Key": API_KEY,
//       "Content-Type": "application/json",
//     },
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const text = await res.text();

//     return NextResponse.json(
//       { error: `Fetch error (${res.status}): ${text}` },
//       { status: res.status },
//     );
//   }

//   const data = await res.json();

//   return NextResponse.json(data);
// }

// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = process.env.GSI_API_KEY || "gsi-attendance-key";

export async function GET(req: NextRequest) {
  const inUrl = new URL(req.url);
  const limit = inUrl.searchParams.get("limit") ?? "500";
  const offset = inUrl.searchParams.get("offset") ?? "0";

  const url = `${BACKEND_URL}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

  let res: Response;

  try {
    res = await fetch(url, {
      // header minimal & tepat untuk GET
      headers: {
        "X-API-Key": API_KEY,
        Accept: "application/json",
      },
      // tetap real-time seperti punyamu
      cache: "no-store",
      keepalive: true, // koneksi backend reuse (lebih stabil/cepat)
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Network error: ${err?.message || String(err)}` },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");

    return NextResponse.json(
      { error: `Fetch error (${res.status}): ${text}` },
      { status: res.status },
    );
  }

  // Tetap cara sederhana: parse JSON lalu kirim lagi (paling kompatibel).
  // Sedikit optimasi: bawa serta cache-control dari backend jika ada.
  const data = await res.json();
  const headers = new Headers();
  const cc = res.headers.get("cache-control");

  if (cc) headers.set("cache-control", cc);

  return NextResponse.json(data, { headers });
}
