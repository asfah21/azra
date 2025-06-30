import { NextRequest, NextResponse } from "next/server";

import { getAssetsData } from "@/app/dashboard/assets/actions/serverAction";

export async function GET(request: NextRequest) {
  try {
    const data = await getAssetsData();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in assets API:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch assets data" },
      { status: 500 }
    );
  }
} 