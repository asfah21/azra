"use server";

import { revalidatePath } from "next/cache";
import { BreakdownStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createBreakdown(prevState: any, formData: FormData) {
  try {
    // Required fields
    const breakdownNumber = formData.get("breakdownNumber") as string;
    const description = formData.get("description") as string;
    const breakdownTime = formData.get("breakdownTime") as string;
    const workingHours = parseFloat(formData.get("workingHours") as string);
    const unitId = formData.get("unitId") as string;
    const reportedById = formData.get("reportedById") as string;
    const priority = formData.get("priority") as string;
    const shift = formData.get("shift") as string;

    // Get components from form data
    const components: Array<{ component: string; subcomponent: string }> = [];
    let index = 0;

    while (formData.get(`components[${index}][component]`)) {
      components.push({
        component: formData.get(`components[${index}][component]`) as string,
        subcomponent: formData.get(`components[${index}][subcomponent]`) as string,
      });
      index++;
    }

    // Validation
    if (
      !description ||
      !breakdownTime ||
      isNaN(workingHours) ||
      !unitId ||
      !reportedById ||
      !priority ||
      !shift
    ) {
      return { success: false, message: "All required fields must be filled!" };
    }

    if (components.length === 0) {
      return {
        success: false,
        message: "At least one component must be added!",
      };
    }

    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return { success: false, message: "Invalid priority value!" };
    }

    const validShifts = ["siang", "malam"];
    if (!validShifts.includes(shift)) {
      return { success: false, message: "Invalid shift value!" };
    }

    const unitExists = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unitExists) {
      return { success: false, message: "Unit not found!" };
    }

    const reporterExists = await prisma.user.findUnique({ where: { id: reportedById } });
    if (!reporterExists) {
      return { success: false, message: "Reporter user not found!" };
    }

    const user = await prisma.user.findUnique({
      where: { id: reportedById },
      select: { role: true },
    });

    const prefix =
      user?.role === "super_admin" || user?.role === "admin_elec"
        ? "WOIT-"
        : "WO-";

    const newBreakdownNumber = await prisma.$transaction(async (tx) => {
      const last = await tx.breakdown.findFirst({
        where: { breakdownNumber: { startsWith: prefix } },
        orderBy: { breakdownNumber: "desc" },
      });

      let nextNumber = 1;
      if (last?.breakdownNumber) {
        const match = last.breakdownNumber.match(/\d+$/);
        if (match) {
          nextNumber = parseInt(match[0], 10) + 1;
        }
      }

      return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    });

    const newBreakdown = await prisma.breakdown.create({
      data: {
        breakdownNumber: newBreakdownNumber,
        description,
        breakdownTime: new Date(breakdownTime),
        workingHours,
        priority,
        shift,
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

    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `Breakdown reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag})`,
        unitId,
      },
    });

    revalidatePath("/dashboard/workorders");

    return {
      success: true,
      message: `Breakdown for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag}) reported successfully!`,
    };
  } catch (error: unknown) {
    console.error("Error creating breakdown:", error);

    if (error instanceof Error && "code" in error && (error as any).code === "P2003") {
      return {
        success: false,
        message: "Invalid unit or user reference!",
      };
    }

    return {
      success: false,
      message: "Failed to report breakdown. Please try again.",
    };
  }
}
