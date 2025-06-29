import { NextResponse } from "next/server";

import { getDashboardData } from "@/app/dashboard/action";

export async function GET() {
  try {
    const dashboardData = await getDashboardData();

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error in dashboard API:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
