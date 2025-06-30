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

    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    response.headers.set('CDN-Cache-Control', 'public, max-age=30');
    
    return response;
  } catch (error) {
    console.error("Error in dashboard API:", error);

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
