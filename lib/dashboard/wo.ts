import { prisma } from "@/lib/prisma";

export async function getBreakdownsData() {
  try {
    const allBreakdowns = await prisma.breakdown.findMany({
      select: {
        id: true,
        breakdownNumber: true,
        description: true,
        breakdownTime: true,
        workingHours: true,
        status: true,
        priority: true,
        createdAt: true,
        unitId: true,
        reportedById: true,
        shift: true,
        inProgressById: true,
        inProgressAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            photo: true,
          },
        },
        inProgressBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            location: true,
            department: true,
            categoryId: true,
            status: true,
          },
        },
        components: true,
        rfuReport: {
          include: {
            resolvedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            actions: {
              orderBy: {
                actionTime: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Hitung stats di server-side
    const total = allBreakdowns.length;
    const progress = allBreakdowns.filter(
      (b) => b.status === "in_progress",
    ).length;
    const rfu = allBreakdowns.filter((b) => b.status === "rfu").length;

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdue = allBreakdowns.filter(
      (b) => b.status === "pending" && b.createdAt < thirtyDaysAgo,
    ).length;

    const pending =
      allBreakdowns.filter((b) => b.status === "pending").length - overdue;

    const breakdownStats = {
      total,
      progress,
      rfu,
      pending,
      overdue,
    };

    return {
      success: true,
      data: {
        allBreakdowns,
        breakdownStats,
      },
    };
  } catch (error) {
    console.error("Error fetching breakdowns:", error);

    return {
      success: false,
      message: "Terjadi kesalahan saat mengambil data breakdowns.",
      data: {
        allBreakdowns: [],
        breakdownStats: {
          total: 0,
          progress: 0,
          rfu: 0,
          pending: 0,
          overdue: 0,
        },
      },
    };
  }
}
