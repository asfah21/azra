import { NextResponse } from "next/server";

import { getDashboardData, getRecentActivities } from "@/app/dashboard/action";

export async function GET() {
  try {
    const [dashboardData, recentActivities] = await Promise.all([
      getDashboardData(),
      getRecentActivities(),
    ]);

    const response = NextResponse.json({
      dashboardData,
      recentActivities,
    });

    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );
    response.headers.set("CDN-Cache-Control", "public, max-age=60");

    return response;
  } catch (error) {
    console.error("Error in dashboard API:", error);

    return NextResponse.json({
      dashboardData: {
        assetStats: { total: 0, active: 0, maintenance: 0, critical: 0 },
        workOrderStats: {
          total: 0,
          pending: 0,
          inProgress: 0,
          rfu: 0,
          overdue: 0,
        },
        monthlyBreakdowns: [],
        categoryDistribution: [],
        maintenancePerformance: [],
      },
      recentActivities: [],
    });
  }
}
