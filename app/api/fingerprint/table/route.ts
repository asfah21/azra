// app/api/logs/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = process.env.GSI_API_KEY || "gsi-attendance-key";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "20";
  const offset = searchParams.get("offset") || "0";

  const url = `${BACKEND_URL}?limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();

    return NextResponse.json(
      { error: `Fetch error (${res.status}): ${text}` },
      { status: res.status },
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
