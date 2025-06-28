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
      data: maintenanceLogs,
    });
  } catch (error) {
    console.error("Error fetching maintenance history:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil riwayat maintenance" },
      { status: 500 },
    );
  }
}
