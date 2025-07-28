import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // const session = await getServerSession(authOptions); //Proteksi API

  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    // Hindari multiple parsing URL
    const url = new URL(req.url);
    const search = url.searchParams;

    const id = search.get("id");
    const units = search.get("units") === "true";
    const nextNumber = search.get("nextNumber") === "true";
    const role = search.get("role");

    // 1. Return list unit
    if (units) {
      const unitsData = await prisma.unit.findMany({
        select: { id: true, name: true, assetTag: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(unitsData, {
        headers: {
          "Cache-Control": "public, max-age=60", // Tambahan ringan
        },
      });
    }

    // 2. Return next breakdown number
    if (nextNumber && role) {
      const prefix =
        role === "super_admin" || role === "admin_elec" ? "WOIT-" : "WO-";

      const nextBreakdownNumber = await prisma.$transaction(async (tx) => {
        const last = await tx.breakdown.findFirst({
          where: { breakdownNumber: { startsWith: prefix } },
          orderBy: { breakdownNumber: "desc" },
          select: { breakdownNumber: true },
        });

        let nextNum = 1;
        const match = last?.breakdownNumber?.match(/\d+$/);
        if (match) nextNum = parseInt(match[0], 10) + 1;

        return `${prefix}${nextNum.toString().padStart(4, "0")}`;
      });

      return NextResponse.json({ nextBreakdownNumber });
    }

    // 3. Return breakdown by ID
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

      if (!breakdown) {
        return NextResponse.json(null, { status: 404 });
      }

      return NextResponse.json(breakdown);
    }

    // 4. Return all breakdowns (default)
    const maxRetries = 3;
    let lastError;

    for (let i = 1; i <= maxRetries; i++) {
      try {
        const allBreakdowns = await prisma.breakdown.findMany({
          include: {
            reportedBy: {
              select: { id: true, name: true, email: true, department: true, photo: true },
            },
            inProgressBy: { select: { id: true, name: true, email: true, photo: true } },
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
                  select: { id: true, name: true, email: true, photo: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Prehitung statistik tanpa mutasi array berkali-kali
        let total = 0,
          progress = 0,
          rfu = 0,
          pending = 0,
          overdue = 0;

        for (const b of allBreakdowns) {
          total++;
          if (b.status === "in_progress") progress++;
          else if (b.status === "rfu") rfu++;
          else if (b.status === "pending") {
            if (b.createdAt < thirtyDaysAgo) overdue++;
            else pending++;
          }
        }

        return NextResponse.json({
          allBreakdowns,
          breakdownStats: { total, progress, rfu, pending, overdue },
        });
      } catch (error) {
        lastError = error;
        if (i < maxRetries) await new Promise((res) => setTimeout(res, 1000 * i));
      }
    }

    return NextResponse.json(
      {
        allBreakdowns: [],
        breakdownStats: { total: 0, progress: 0, rfu: 0, pending: 0, overdue: 0 },
      },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
