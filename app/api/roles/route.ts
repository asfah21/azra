// app/api/roles/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { consolePino } from "@/lib/logger";

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 requests per window

// Validation schema
const createRoleSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[a-z_]+$/, "Code must be lowercase with underscores only"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("default"),
  priority: z.number().default(0),
});

const updateRoleSchema = createRoleSchema.partial();

// GET: Fetch all roles
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting
  const userKey = session.user?.email || session.user?.id || "anonymous";
  const now = Date.now();
  const userRate = rateLimitMap.get(userKey) || { count: 0, last: now };

  if (
    now - userRate.last < RATE_LIMIT_WINDOW &&
    userRate.count >= RATE_LIMIT_MAX
  ) {
    return NextResponse.json(
      { message: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  if (now - userRate.last > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userKey, { count: 1, last: now });
  } else {
    rateLimitMap.set(userKey, {
      count: userRate.count + 1,
      last: userRate.last,
    });
  }

  try {
    const roles = await prisma.roleModel.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            roleAccess: true,
          },
        },
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    consolePino.error("Error fetching roles:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST: Create new role
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin can create roles
  if (session.user?.role !== "super_admin") {
    return NextResponse.json(
      { message: "Forbidden: only Super Admin can create roles" },
      { status: 403 },
    );
  }

  // Rate limiting
  const userKey = session.user?.email || session.user?.id || "anonymous";
  const now = Date.now();
  const userRate = rateLimitMap.get(userKey) || { count: 0, last: now };

  if (
    now - userRate.last < RATE_LIMIT_WINDOW &&
    userRate.count >= RATE_LIMIT_MAX
  ) {
    return NextResponse.json(
      { message: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  if (now - userRate.last > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userKey, { count: 1, last: now });
  } else {
    rateLimitMap.set(userKey, {
      count: userRate.count + 1,
      last: userRate.last,
    });
  }

  try {
    const body = await request.json();
    const validatedData = createRoleSchema.parse(body);

    // Check if code already exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { code: validatedData.code },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: "Role code already exists" },
        { status: 400 },
      );
    }

    const role = await prisma.roleModel.create({
      data: validatedData,
    });

    consolePino.info(
      `Role created: ${role.name} (${role.code}) by ${session.user.email}`,
    );

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 },
      );
    }

    consolePino.error("Error creating role:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
