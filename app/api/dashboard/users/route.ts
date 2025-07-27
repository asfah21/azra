import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/users
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions); //Proteksi API

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        lastActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Statistik
    const totalUsers = allUsers.length;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsers = allUsers.filter(
      (user) => user.createdAt >= startOfMonth,
    ).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = allUsers.filter(
      (user) => user.lastActive && user.lastActive >= thirtyDaysAgo,
    ).length;

    const inactiveUsers = allUsers.filter(
      (user) => !user.lastActive || user.lastActive < thirtyDaysAgo,
    ).length;

    const userStats = {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    };

    return NextResponse.json({
      success: true,
      data: {
        users: allUsers,
        stats: userStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data users.",
        data: {
          users: [],
          stats: { total: 0, new: 0, active: 0, inactive: 0 },
        },
      },
      { status: 500 }
    );
  }
}
