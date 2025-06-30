import { NextRequest, NextResponse } from "next/server";

import { getAssetsData } from "@/app/dashboard/assets/actions/serverAction";

export async function GET(request: NextRequest) {
  try {
    const data = await getAssetsData();

    const response = NextResponse.json(data);

    // Tambah cache headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );
    response.headers.set("CDN-Cache-Control", "public, max-age=60");

    return response;
  } catch (error) {
    console.error("Error in assets API:", error);

    // Return fallback data instead of error
    return NextResponse.json({
      allAssets: [],
      assetStats: {
        total: 0,
        new: 0,
        active: 0,
        maintenance: 0,
        critical: 0,
      },
      users: [],
    });
  }
}
