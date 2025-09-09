import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { consolePino } from "@/lib/logger";

// GET /api/dashboard/roles
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const roles = await prisma.roleModel.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
        isActive: true,
        priority: true,
      },
      where: { isActive: true },
      orderBy: { priority: "asc" },
    });
    return NextResponse.json({ roles });
  } catch (error) {
    consolePino.error("Error fetching roles:", error);
    return NextResponse.json({ roles: [] }, { status: 500 });
  }
}
