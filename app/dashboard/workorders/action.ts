"use server";

import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Di dalam file action.ts yang sama
export async function getUnits() {
  try {
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        assetTag: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return units;
  } catch (error) {
    console.error("Error fetching units:", error);

    return [];
  }
}

async function getNextBreakdownNumber(prefix: string) {
  try {
    // Cari breakdown terakhir dengan prefix yang sama
    const lastBreakdown = await prisma.breakdown.findFirst({
      where: {
        breakdownNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        breakdownNumber: "desc",
      },
    });

    if (!lastBreakdown) {
      // Jika belum ada breakdown dengan prefix ini, mulai dari 0001
      return `${prefix}-0001`;
    }

    // Ambil angka dari breakdown number terakhir
    const lastNumber = lastBreakdown.breakdownNumber
      ? parseInt(lastBreakdown.breakdownNumber.split("-")[1])
      : 0;
    // Tambah 1 dan format dengan leading zeros
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

    return `${prefix}-${nextNumber}`;
  } catch (error) {
    console.error("Error getting next breakdown number:", error);
    throw error;
  }
}

export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Required fields
    const breakdownNumber = formData.get("breakdownNumber") as string;
    const description = formData.get("description") as string;
    const breakdownTime = formData.get("breakdownTime") as string;
    const workingHours = parseFloat(formData.get("workingHours") as string);
    const unitId = formData.get("unitId") as string;
    const reportedById = formData.get("reportedById") as string;

    // Get components from form data
    const components: Array<{ component: string; subcomponent: string }> = [];
    let index = 0;

    while (formData.get(`components[${index}][component]`)) {
      components.push({
        component: formData.get(`components[${index}][component]`) as string,
        subcomponent: formData.get(
          `components[${index}][subcomponent]`,
        ) as string,
      });
      index++;
    }

    // Validation
    if (
      !description ||
      !breakdownTime ||
      isNaN(workingHours) ||
      !unitId ||
      !reportedById
    ) {
      return { success: false, message: "All required fields must be filled!" };
    }

    if (components.length === 0) {
      return {
        success: false,
        message: "At least one component must be added!",
      };
    }

    // Check if unit exists
    const unitExists = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    // Check if reporter exists
    const reporterExists = await prisma.user.findUnique({
      where: { id: reportedById },
    });

    if (!reporterExists) {
      return { success: false, message: "Reporter user not found!" };
    }

    // Get user role untuk menentukan prefix
    const user = await prisma.user.findUnique({
      where: { id: reportedById },
      select: { role: true },
    });

    const prefix =
      user?.role === "super_admin" || user?.role === "admin_elec"
        ? "WOIT"
        : "WO";
    const newBreakdownNumber = await getNextBreakdownNumber(prefix);

    // Create the breakdown
    const newBreakdown = await prisma.breakdown.create({
      data: {
        breakdownNumber: newBreakdownNumber,
        description,
        breakdownTime: new Date(breakdownTime),
        workingHours,
        status: BreakdownStatus.pending,
        unitId,
        reportedById,
        components: {
          create: components.map((comp) => ({
            component: comp.component,
            subcomponent: comp.subcomponent,
          })),
        },
      },
      include: {
        components: true,
        unit: true,
      },
    });

    // Create history log
    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `Breakdown reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag})`,
        unitId,
      },
    });

    revalidatePath("/units");
    revalidatePath("/docs");

    return {
      success: true,
      message: `Breakdown for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) reported successfully!`,
    };
  } catch (error: unknown) {
    console.error("Error creating breakdown:", error);

    if (error instanceof Error) {
      if ("code" in error && error.code === "P2003") {
        return {
          success: false,
          message: "Invalid unit or user reference!",
        };
      }
    }

    return {
      success: false,
      message: "Failed to report breakdown. Please try again.",
    };
  }
}
