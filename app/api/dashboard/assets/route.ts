import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/assets
export async function GET(req: NextRequest) {
  try {
    const allAssets = await prisma.unit.findMany({
      select: {
        id: true,
        assetTag: true,
        name: true,
        description: true,
        categoryId: true,
        status: true,
        condition: true,
        serialNumber: true,
        location: true,
        department: true,
        manufacturer: true,
        installDate: true,
        warrantyExpiry: true,
        lastMaintenance: true,
        nextMaintenance: true,
        assetValue: true,
        utilizationRate: true,
        createdAt: true,
        createdById: true,
        assignedToId: true,
        breakdowns: {
          where: {
            status: {
              in: ["pending", "in_progress"],
            },
          },
          select: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Hitung stats dari data yang sudah di-fetch
    const totalAssets = allAssets.length;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newAssets = allAssets.filter(
      (asset) => asset.createdAt >= startOfMonth,
    ).length;

    const activeAssets = allAssets.filter(
      (asset) =>
        asset.status?.toLowerCase() === "operational" &&
        (asset.condition?.toLowerCase() === "good" ||
          asset.condition?.toLowerCase() === "excellent" ||
          !asset.condition),
    ).length;

    const maintenanceAssets = allAssets.filter(
      (asset) => asset.status === "maintenance" || asset.breakdowns.length > 0,
    ).length;

    const criticalAssets = allAssets.filter(
      (asset) =>
        asset.condition === "poor" ||
        asset.condition === "critical" ||
        asset.breakdowns.some(
          (breakdown) =>
            breakdown.priority === "HIGH" || breakdown.priority === "CRITICAL",
        ),
    ).length;

    const assetStats = {
      total: totalAssets,
      new: newAssets,
      active: activeAssets,
      maintenance: maintenanceAssets,
      critical: criticalAssets,
    };

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      allAssets,
      assetStats,
      users,
    });
  } catch (error) {
    console.error("Error fetching assets data:", error);
    return NextResponse.json(
      { allAssets: [], assetStats: {}, users: [] },
      { status: 500 }
    );
  }
} 