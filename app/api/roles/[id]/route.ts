// app/api/roles/[id]/route.ts
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
const updateRoleSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[a-z_]+$/, "Code must be lowercase with underscores only")
    .optional(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET: Fetch single role by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const role = await prisma.roleModel.findUnique({
      where: { id: params.id },
      include: {
        roleAccess: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            roleAccess: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    consolePino.error("Error fetching role:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT: Update role
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin can update roles
  if (session.user?.role !== "super_admin") {
    return NextResponse.json(
      { message: "Forbidden: only Super Admin can update roles" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Check if role exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    // Check if code already exists (if updating code)
    if (validatedData.code && validatedData.code !== existingRole.code) {
      const codeExists = await prisma.roleModel.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { message: "Role code already exists" },
          { status: 400 },
        );
      }
    }

    const updatedRole = await prisma.roleModel.update({
      where: { id: params.id },
      data: validatedData,
    });

    consolePino.info(
      `Role updated: ${updatedRole.name} (${updatedRole.code}) by ${session.user.email}`,
    );

    return NextResponse.json(updatedRole);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.issues },
        { status: 400 },
      );
    }

    consolePino.error("Error updating role:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: Soft delete role (set isActive to false)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin can delete roles
  if (session.user?.role !== "super_admin") {
    return NextResponse.json(
      { message: "Forbidden: only Super Admin can delete roles" },
      { status: 403 },
    );
  }

  try {
    // Check if role exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { id: params.id },
    });

    if (!existingRole) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    // Prevent deletion of super_admin role
    if (existingRole.code === "super_admin") {
      return NextResponse.json(
        { message: "Cannot delete super_admin role" },
        { status: 400 },
      );
    }

    // Soft delete (set isActive to false)
    const deletedRole = await prisma.roleModel.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    consolePino.info(
      `Role deleted: ${deletedRole.name} (${deletedRole.code}) by ${session.user.email}`,
    );

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    consolePino.error("Error deleting role:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
