import { NextRequest, NextResponse } from "next/server";
import { getBreakdownsData } from "@/app/dashboard/workorders/action";

export async function GET(request: NextRequest) {
  try {
    const data = await getBreakdownsData();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
} 