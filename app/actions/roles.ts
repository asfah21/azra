// app/actions/roles.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { consolePino } from "@/lib/logger";

// Form state type
export interface FormState {
  errors?: {
    code?: string[];
    name?: string[];
    description?: string[];
    color?: string[];
    priority?: string[];
    general?: string;
  };
  success?: string;
}

// Validation schemas
const createRoleSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(/^[a-z_]+$/, "Code must be lowercase with underscores only")
    .max(50, "Code must be less than 50 characters"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(255, "Description must be less than 255 characters")
    .optional(),
  color: z
    .string()
    .min(1, "Color is required")
    .default("default"),
  priority: z
    .number()
    .min(0, "Priority must be non-negative")
    .default(0),
});

const updateRoleSchema = createRoleSchema.partial();

// Server action: Create role
export async function createRole(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        errors: {
          general: "Unauthorized: Please login first.",
        },
      };
    }

    // Only super_admin can create roles
    if (session.user?.role !== "super_admin") {
      return {
        errors: {
          general: "Forbidden: Only Super Admin can create roles.",
        },
      };
    }

    // Parse and validate form data
    const rawData = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      color: formData.get("color") as string || "default",
      priority: parseInt(formData.get("priority") as string) || 0,
    };

    const validatedData = createRoleSchema.parse(rawData);

    // Check if code already exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { code: validatedData.code },
    });

    if (existingRole) {
      return {
        errors: {
          code: ["Role code already exists"],
        },
      };
    }

    // Create role
    const role = await prisma.roleModel.create({
      data: validatedData,
    });

    consolePino.info(`Role created: ${role.name} (${role.code}) by ${session.user.email}`);

    // Revalidate pages
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/auth");

    return {
      success: `Role "${role.name}" created successfully`,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(issue.message);
        }
      });

      return { errors: fieldErrors as FormState["errors"] };
    }

    consolePino.error("Error creating role:", error);
    return {
      errors: {
        general: "Failed to create role. Please try again.",
      },
    };
  }
}

// Server action: Update role
export async function updateRole(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        errors: {
          general: "Unauthorized: Please login first.",
        },
      };
    }

    // Only super_admin can update roles
    if (session.user?.role !== "super_admin") {
      return {
        errors: {
          general: "Forbidden: Only Super Admin can update roles.",
        },
      };
    }

    // Check if role exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return {
        errors: {
          general: "Role not found.",
        },
      };
    }

    // Parse and validate form data
    const rawData = {
      code: formData.get("code") as string || undefined,
      name: formData.get("name") as string || undefined,
      description: formData.get("description") as string || undefined,
      color: formData.get("color") as string || undefined,
      priority: formData.get("priority") ? parseInt(formData.get("priority") as string) : undefined,
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, value]) => value !== undefined)
    );

    const validatedData = updateRoleSchema.parse(cleanData);

    // Check if code already exists (if updating code)
    if (validatedData.code && validatedData.code !== existingRole.code) {
      const codeExists = await prisma.roleModel.findUnique({
        where: { code: validatedData.code },
      });

      if (codeExists) {
        return {
          errors: {
            code: ["Role code already exists"],
          },
        };
      }
    }

    // Update role
    const updatedRole = await prisma.roleModel.update({
      where: { id },
      data: validatedData,
    });

    consolePino.info(`Role updated: ${updatedRole.name} (${updatedRole.code}) by ${session.user.email}`);

    // Revalidate pages
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/auth");

    return {
      success: `Role "${updatedRole.name}" updated successfully`,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(issue.message);
        }
      });

      return { errors: fieldErrors as FormState["errors"] };
    }

    consolePino.error("Error updating role:", error);
    return {
      errors: {
        general: "Failed to update role. Please try again.",
      },
    };
  }
}

// Server action: Delete role (soft delete)
export async function deleteRole(id: string): Promise<FormState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        errors: {
          general: "Unauthorized: Please login first.",
        },
      };
    }

    // Only super_admin can delete roles
    if (session.user?.role !== "super_admin") {
      return {
        errors: {
          general: "Forbidden: Only Super Admin can delete roles.",
        },
      };
    }

    // Check if role exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return {
        errors: {
          general: "Role not found.",
        },
      };
    }

    // Prevent deletion of super_admin role
    if (existingRole.code === "super_admin") {
      return {
        errors: {
          general: "Cannot delete super_admin role.",
        },
      };
    }

    // Soft delete (set isActive to false)
    const deletedRole = await prisma.roleModel.update({
      where: { id },
      data: { isActive: false },
    });

    consolePino.info(`Role deleted: ${deletedRole.name} (${deletedRole.code}) by ${session.user.email}`);

    // Revalidate pages
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/auth");

    return {
      success: `Role "${deletedRole.name}" deleted successfully`,
    };

  } catch (error) {
    consolePino.error("Error deleting role:", error);
    return {
      errors: {
        general: "Failed to delete role. Please try again.",
      },
    };
  }
}

// Server action: Toggle role status
export async function toggleRoleStatus(id: string, isActive: boolean): Promise<FormState> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        errors: {
          general: "Unauthorized: Please login first.",
        },
      };
    }

    // Only super_admin can toggle role status
    if (session.user?.role !== "super_admin") {
      return {
        errors: {
          general: "Forbidden: Only Super Admin can modify roles.",
        },
      };
    }

    // Check if role exists
    const existingRole = await prisma.roleModel.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return {
        errors: {
          general: "Role not found.",
        },
      };
    }

    // Prevent deactivation of super_admin role
    if (existingRole.code === "super_admin" && !isActive) {
      return {
        errors: {
          general: "Cannot deactivate super_admin role.",
        },
      };
    }

    // Update role status
    const updatedRole = await prisma.roleModel.update({
      where: { id },
      data: { isActive },
    });

    const action = isActive ? "activated" : "deactivated";
    consolePino.info(`Role ${action}: ${updatedRole.name} (${updatedRole.code}) by ${session.user.email}`);

    // Revalidate pages
    revalidatePath("/dashboard/roles");
    revalidatePath("/dashboard/auth");

    return {
      success: `Role "${updatedRole.name}" ${action} successfully`,
    };

  } catch (error) {
    consolePino.error("Error toggling role status:", error);
    return {
      errors: {
        general: "Failed to update role status. Please try again.",
      },
    };
  }
}
