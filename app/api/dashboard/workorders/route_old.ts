import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/dashboard/workorders
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions); //Proteksi API

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const units = searchParams.get("units");
    const nextNumber = searchParams.get("nextNumber");
    const role = searchParams.get("role");

    // GET units
    if (units === "true") {
      const unitsData = await prisma.unit.findMany({
        select: { id: true, name: true, assetTag: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(unitsData);
    }

    // GET next breakdown number
    if (nextNumber === "true" && role) {
      const prefix =
        role === "super_admin" || role === "admin_elec" ? "WOIT-" : "WO-";

      const nextBreakdownNumber = await prisma.$transaction(async (tx) => {
        const last = await tx.breakdown.findFirst({
          where: { breakdownNumber: { startsWith: prefix } },
          orderBy: { breakdownNumber: "desc" },
        });

        let nextNumber = 1;

        if (last?.breakdownNumber) {
          const match = last.breakdownNumber.match(/\d+$/);

          if (match) nextNumber = parseInt(match[0], 10) + 1;
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
      });

      return NextResponse.json({ nextBreakdownNumber });
    }

    // GET breakdown by id
    if (id) {
      const breakdown = await prisma.breakdown.findUnique({
        where: { id },
        include: {
          unit: true,
          reportedBy: { select: { name: true, email: true, id: true } },
          inProgressBy: { select: { name: true, email: true, id: true } },
          components: true,
          rfuReport: { include: { resolvedBy: true } },
        },
      });

      if (!breakdown) return NextResponse.json(null, { status: 404 });

      return NextResponse.json(breakdown);
    }

    // GET all breakdowns (default)
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const allBreakdowns = await prisma.breakdown.findMany({
          include: {
            reportedBy: {
              select: { id: true, name: true, email: true, department: true },
            },
            inProgressBy: { select: { id: true, name: true, email: true } },
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
            rfuReport: {
              include: {
                resolvedBy: { select: { id: true, name: true, email: true } },
                actions: { orderBy: { actionTime: "asc" } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

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

        const breakdownStats = { total, progress, rfu, pending, overdue };

        return NextResponse.json({ allBreakdowns, breakdownStats });
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries)
          await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }

    // Gagal semua retry
    return NextResponse.json(
      {
        allBreakdowns: [],
        breakdownStats: {
          total: 0,
          progress: 0,
          rfu: 0,
          pending: 0,
          overdue: 0,
        },
      },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
