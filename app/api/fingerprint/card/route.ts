import { NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = "http://188.245.70.138:8080/api/logs";
const API_KEY = "gsi-attendance-key";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "10";
  const offset = searchParams.get("offset") || "0";

  try {
    const res = await axios.get(BACKEND_URL, {
      params: { limit, offset },
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 5000, // optional: supaya tidak hang
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Proxy error (fingerprint):", error.message);

    return NextResponse.json(
      { error: "Failed to fetch fingerprint logs" },
      { status: 500 },
    );
  }
}
