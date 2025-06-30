import { NextResponse } from "next/server";

import { getDashboardData, getRecentActivities } from "@/app/dashboard/action";

export async function GET() {
  try {
    const [dashboardData, recentActivities] = await Promise.all([
      getDashboardData(),
      getRecentActivities(),
    ]);

    return NextResponse.json({
      dashboardData,
      recentActivities,
    });
  } catch (error) {
    console.error("Error in dashboard API:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
