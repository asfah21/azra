// app/api/fingerprint/card/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

// API KEY internal untuk proteksi route ini
const INTERNAL_KEY = process.env.INTERNAL_FP_API_KEY;

export async function GET(req: NextRequest) {
  // --- Internal Security Check ---
  const reqKey = req.headers.get("x-internal-key");

  if (!reqKey || reqKey !== INTERNAL_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Extract Params ---
  const limit = req.nextUrl.searchParams.get("limit") ?? "500";
  const offset = req.nextUrl.searchParams.get("offset") ?? "0";

  const url = `${BACKEND_URL}?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`;

  try {
    // Fetch backend (tanpa axios)
    const backendRes = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY,
        Accept: "application/json",
      },
      cache: "no-store",
      keepalive: true,
    });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");

      return NextResponse.json(
        { error: `Backend error (${backendRes.status}): ${text}` },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Fingerprint proxy error:", err);

    return NextResponse.json(
      { error: "Failed to fetch fingerprint logs" },
      { status: 500 },
    );
  }
}
