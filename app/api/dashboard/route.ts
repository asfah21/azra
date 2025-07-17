import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // ✅ Query parameters untuk filtering
    const timeRange = searchParams.get('timeRange') || '6months'; // 6months, 3months, 1month, 1year
    const categoryFilter = searchParams.get('category'); // Filter by specific category
    const statusFilter = searchParams.get('status'); // Filter by asset status
    const includeInactive = searchParams.get('includeInactive') === 'true'; // Include inactive assets

    // ✅ Time range calculation
    const currentDate = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        break;
      case '3months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        break;
      case '1year':
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
        break;
      default: // 6months
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        break;
    }

    // ✅ Build where clause untuk filtering
    const assetWhereClause: any = {};
    const breakdownWhereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (categoryFilter) {
      assetWhereClause.category = {
        name: categoryFilter,
      };
    }

    if (statusFilter) {
      assetWhereClause.status = statusFilter;
    }

    if (!includeInactive) {
      assetWhereClause.status = {
        not: 'inactive',
      };
    }

    // ✅ Get asset statistics dengan filtering
    const assets = await prisma.unit.findMany({
      where: assetWhereClause,
      select: {
        status: true,
        condition: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
        breakdowns: {
          where: {
            status: {
              in: ["pending", "in_progress"],
            },
          },
        },
      },
    });

    // ✅ Get work order statistics dengan time filtering
    const breakdowns = await prisma.breakdown.findMany({
      where: breakdownWhereClause,
      select: {
        status: true,
        breakdownTime: true,
        createdAt: true,
      },
    });

    // ✅ Calculate asset stats
    const assetStats = {
      total: assets.length,
      active: assets.filter((asset) => asset.status === "operational").length,
      maintenance: assets.filter((asset) => asset.status === "maintenance").length,
      critical: assets.filter(
        (asset) => asset.condition === "critical" || asset.condition === "poor",
      ).length,
      inactive: assets.filter((asset) => asset.status === "inactive").length,
    };

    // ✅ Calculate work order stats
    const workOrderStats = {
      total: breakdowns.length,
      pending: breakdowns.filter((b) => b.status === "pending").length,
      inProgress: breakdowns.filter((b) => b.status === "in_progress").length,
      rfu: breakdowns.filter((b) => b.status === "rfu").length,
      overdue: breakdowns.filter((b) => b.status === "overdue").length,
    };

    // ✅ Calculate monthly breakdowns dengan dynamic months
    const monthlyBreakdowns = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Calculate how many months to show based on timeRange
    let monthsToShow = 6;
    switch (timeRange) {
      case '1month':
        monthsToShow = 1;
        break;
      case '3months':
        monthsToShow = 3;
        break;
      case '1year':
        monthsToShow = 12;
        break;
      default:
        monthsToShow = 6;
    }

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1,
      );

      const count = breakdowns.filter((b) => {
        const breakdownDate = new Date(b.createdAt);
        return breakdownDate >= monthDate && breakdownDate < nextMonth;
      }).length;

      monthlyBreakdowns.push({
        month: months[monthDate.getMonth()],
        count,
        year: monthDate.getFullYear(),
      });
    }

    // ✅ Calculate category distribution
    const categoryCounts = assets.reduce(
      (acc, asset) => {
        const categoryName = asset.category?.name || "Unknown";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categoryDistribution = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        count,
        percentage: assets.length > 0 ? Math.round((count / assets.length) * 100) : 0,
      }),
    );

    // ✅ Mock maintenance performance data (bisa diganti dengan real data)
    const maintenancePerformance = [
      { department: "Heavy Equipment", completionRate: 92, totalTasks: 45, completedTasks: 41 },
      { department: "Electrical", completionRate: 88, totalTasks: 38, completedTasks: 33 },
      { department: "Mechanical", completionRate: 85, totalTasks: 52, completedTasks: 44 },
      { department: "General", completionRate: 78, totalTasks: 28, completedTasks: 22 },
    ];

    // ✅ Structured response format
    const dashboardData = {
      assetStats,
      workOrderStats,
      monthlyBreakdowns,
      categoryDistribution,
      maintenancePerformance,
      metadata: {
        timeRange,
        totalAssets: assets.length,
        totalBreakdowns: breakdowns.length,
        lastUpdated: new Date().toISOString(),
        filters: {
          category: categoryFilter,
          status: statusFilter,
          includeInactive,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: "Dashboard data retrieved successfully",
    });

  } catch (error) {
    console.error("Error in dashboard API:", error);

    // ✅ Better error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch dashboard data",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
