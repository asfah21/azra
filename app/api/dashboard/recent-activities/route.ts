import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "0", 10);
    const type = searchParams.get("type"); // filter by activity type
    const user = searchParams.get("user"); // filter by user name
    const from = searchParams.get("from"); // date from (ISO)
    const to = searchParams.get("to"); // date to (ISO)

    // Build where clause
    const where: any = {};

    if (type) where.logType = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // Fetch activities with pagination and filter
    const [totalCount, recentActivities] = await Promise.all([
      prisma.unitHistory.count({ where }),
      prisma.unitHistory.findMany({
        where,
        take: limit,
        skip: page * limit,
        orderBy: { createdAt: "desc" },
        include: {
          unit: { select: { name: true, assetTag: true } },
        },
      }),
    ]);

    // Fetch referenced breakdowns and users as before
    const breakdownIds = recentActivities
      .filter(
        (activity) =>
          activity.logType === "breakdown" ||
          activity.logType === "status_update",
      )
      .map((activity) => activity.referenceId);

    const breakdowns =
      breakdownIds.length > 0
        ? await prisma.breakdown.findMany({
            where: { id: { in: breakdownIds } },
            select: {
              id: true,
              breakdownNumber: true,
              reportedBy: { select: { name: true } },
              inProgressBy: { select: { name: true } },
            },
          })
        : [];

    const userIds = recentActivities
      .filter(
        (activity) =>
          activity.logType === "asset_created" ||
          activity.logType === "unit_status_change",
      )
      .map((activity) => activity.referenceId);

    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
          })
        : [];

    // Format aktivitas
    const formattedActivities = recentActivities.map((activity, index) => {
      const breakdown = breakdowns.find((b) => b.id === activity.referenceId);
      const userObj = users.find((u) => u.id === activity.referenceId);

      let userName = "System";
      let action = activity.message;
      let typeLabel = "default";

      switch (activity.logType) {
        case "breakdown":
          typeLabel = "breakdown";
          userName = breakdown?.reportedBy?.name || "Unknown User";
          break;
        case "status_update":
          typeLabel = "workorder";
          userName =
            breakdown?.inProgressBy?.name ||
            breakdown?.reportedBy?.name ||
            "Unknown User";
          break;
        case "asset_created":
          typeLabel = "asset";
          userName = userObj?.name || "Admin";
          break;
        case "unit_status_change":
          typeLabel = "maintenance";
          userName = "System";
          break;
        case "breakdown_deleted":
          typeLabel = "breakdown";
          userName = "Admin";
          break;
        default:
          typeLabel = "default";
      }

      // Format waktu
      const now = new Date();
      const activityTime = new Date(activity.createdAt);
      const diffInMinutes = Math.floor(
        (now.getTime() - activityTime.getTime()) / (1000 * 60),
      );
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      let timeText = "";

      if (diffInMinutes < 1) {
        timeText = "Baru saja";
      } else if (diffInMinutes < 60) {
        timeText = `${diffInMinutes} menit yang lalu`;
      } else if (diffInHours < 24) {
        timeText = `${diffInHours} jam yang lalu`;
      } else if (diffInDays < 7) {
        timeText = `${diffInDays} hari yang lalu`;
      } else {
        timeText = activityTime.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      return {
        id: activity.id,
        user: userName,
        action: action,
        time: timeText,
        avatar: `https://i.pravatar.cc/150?u=${index + 1}`,
        type: type,
        createdAt: activity.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedActivities,
      message: "Recent activities retrieved successfully",
      metadata: {
        total: totalCount,
        page,
        limit,
        filters: {
          type,
          user,
          from,
          to,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in recent activities API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent activities",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
