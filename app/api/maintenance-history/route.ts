import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    if (!unitId) {
      return NextResponse.json(
        { message: "Unit ID diperlukan!" },
        { status: 400 },
      );
    }

    // Ambil RFU reports untuk unit ini
    const maintenanceLogs = await prisma.rFUReport.findMany({
      where: {
        breakdown: {
          unitId: unitId,
        },
      },
      include: {
        resolvedBy: {
          select: {
            name: true,
          },
        },
        breakdown: {
          select: {
            breakdownNumber: true,
            description: true,
            breakdownTime: true,
            status: true,
          },
        },
        actions: {
          orderBy: {
            actionTime: "asc",
          },
        },
      },
      orderBy: {
        resolvedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: maintenanceLogs.map((log) => ({
        ...log,
        resolvedAt: log.resolvedAt?.toISOString(),
        actions: log.actions.map((action) => ({
          ...action,
          actionTime: action.actionTime?.toISOString(),
        })),
        breakdown: {
          ...log.breakdown,
          breakdownTime: log.breakdown.breakdownTime?.toISOString(),
        },
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat mengambil riwayat maintenance",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
