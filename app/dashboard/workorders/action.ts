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

// Fungsi untuk generate nomor breakdown berikutnya dengan transaction
export async function getNextBreakdownNumber(role: string) {
  const prefix =
    role === "super_admin" || role === "admin_elec" ? "WOIT-" : "WO-";

  // Gunakan transaction untuk memastikan atomicity
  return await prisma.$transaction(async (tx) => {
    // Lock dan cari nomor terakhir dengan prefix yang sesuai
    const last = await tx.breakdown.findFirst({
      where: {
        breakdownNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        breakdownNumber: "desc",
      },
    });

    let nextNumber = 1;

    if (last && last.breakdownNumber) {
      // Ambil angka di belakang prefix, misal dari WOIT0005 ambil 5
      const match = last.breakdownNumber.match(/\d+$/);

      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    // Format dengan leading zero, misal 6 jadi 0006
    const nextBreakdownNumber = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

    return nextBreakdownNumber;
  });
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
    const priority = formData.get("priority") as string;
    const shift = formData.get("shift") as string;

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

    // Validate priority value
    const validPriorities = ["low", "medium", "high"];

    if (!validPriorities.includes(priority)) {
      return { success: false, message: "Invalid priority value!" };
    }

    // Validate shift value
    const validShifts = ["siang", "malam"];

    if (!validShifts.includes(shift)) {
      return { success: false, message: "Invalid shift value!" };
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
        ? "WOIT-"
        : "WO-";
    const newBreakdownNumber = await getNextBreakdownNumber(user?.role || "");

    // Create the breakdown
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

    // Create history log
    await prisma.unitHistory.create({
      data: {
        logType: "breakdown",
        referenceId: newBreakdown.id,
        message: `Breakdown reported for ${newBreakdown.unit.name} (${newBreakdown.unit.assetTag})`,
        unitId,
      },
    });

    revalidatePath("/dashboard/gamma");

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

export async function updateBreakdownStatus(
  id: string,
  status: BreakdownStatus,
  resolvedById?: string,
) {
  try {
    const updateData: any = { status };

    // Jika status berubah menjadi in_progress dan ada user ID
    if (status === "in_progress" && resolvedById) {
      updateData.inProgressById = resolvedById;
      updateData.inProgressAt = new Date();
    }

    const updatedBreakdown = await prisma.breakdown.update({
      where: { id },
      data: updateData,
      include: {
        unit: true,
        inProgressBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Jika status adalah RFU dan ada resolvedById, buat RFUReport
    if (status === "rfu" && resolvedById) {
      await prisma.rFUReport.create({
        data: {
          solution: "Marked as RFU by user",
          breakdownId: id,
          resolvedById: resolvedById,
        },
      });
    }

    await prisma.unitHistory.create({
      data: {
        logType: "status_update",
        referenceId: updatedBreakdown.id,
        message: `Status for breakdown ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status} by ${updatedBreakdown.inProgressBy?.name || "unknown user"}.`,
        unitId: updatedBreakdown.unitId,
      },
    });

    revalidatePath("/dashboard/gamma");

    return { success: true, message: "Breakdown status updated." };
  } catch (error) {
    console.error("Error updating breakdown status:", error);

    return { success: false, message: "Failed to update status." };
  }
}

export async function deleteBreakdown(id: string) {
  try {
    const breakdownToDelete = await prisma.breakdown.findUnique({
      where: { id },
      select: {
        unitId: true,
        breakdownNumber: true,
        unit: {
          select: {
            name: true,
            assetTag: true,
          },
        },
      },
    });

    if (!breakdownToDelete) {
      return { success: false, message: "Breakdown not found!" };
    }

    await prisma.$transaction([
      prisma.rFUReport.deleteMany({
        where: { breakdownId: id },
      }),
      prisma.breakdownComponent.deleteMany({
        where: { breakdownId: id },
      }),
      prisma.breakdown.delete({
        where: { id },
      }),
    ]);

    await prisma.unitHistory.create({
      data: {
        logType: "breakdown_deleted",
        referenceId: id,
        message: `Breakdown report ${breakdownToDelete.breakdownNumber} for ${breakdownToDelete.unit.name} deleted.`,
        unitId: breakdownToDelete.unitId,
      },
    });

    revalidatePath("/dashboard/gamma");

    return { success: true, message: "Breakdown deleted successfully!" };
  } catch (error) {
    console.error("Error deleting breakdown:", error);

    return { success: false, message: "Failed to delete breakdown." };
  }
}

export async function getBreakdownById(id: string) {
  try {
    const breakdown = await prisma.breakdown.findUnique({
      where: { id },
      include: {
        unit: true,
        reportedBy: {
          select: {
            name: true,
            email: true,
            id: true,
          },
        },
        inProgressBy: {
          select: {
            name: true,
            email: true,
            id: true,
          },
        },
        components: true,
        rfuReport: {
          include: {
            resolvedBy: true,
          },
        },
      },
    });

    if (!breakdown) {
      return null;
    }

    return breakdown;
  } catch (error) {
    console.error("Error fetching breakdown:", error);

    return null;
  }
}

export async function updateBreakdownStatusWithActions(
  id: string,
  status: BreakdownStatus,
  solution: string,
  actions: Array<{ action: string; description: string }>,
  resolvedById?: string,
) {
  try {
    const updatedBreakdown = await prisma.breakdown.update({
      where: { id },
      data: { status },
      include: { unit: true },
    });

    // Jika status adalah RFU dan ada resolvedById, buat RFUReport dengan actions
    if (status === "rfu" && resolvedById) {
      const rfuReport = await prisma.rFUReport.create({
        data: {
          solution: solution,
          breakdownId: id,
          resolvedById: resolvedById,
        },
      });

      // Buat actions untuk RFU report
      if (actions.length > 0) {
        await prisma.rFUReportAction.createMany({
          data: actions.map((action) => ({
            action: action.action,
            description: action.description || null,
            rfuReportId: rfuReport.id,
          })),
        });
      }
    }

    await prisma.unitHistory.create({
      data: {
        logType: "status_update",
        referenceId: updatedBreakdown.id,
        message: `Status for breakdown ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status} with ${actions.length} actions.`,
        unitId: updatedBreakdown.unitId,
      },
    });

    revalidatePath("/dashboard/gamma");

    return { success: true, message: "Breakdown status updated with actions." };
  } catch (error) {
    console.error("Error updating breakdown status with actions:", error);

    return { success: false, message: "Failed to update status with actions." };
  }
}

export async function updateBreakdownStatusWithUnitStatus(
  id: string,
  status: BreakdownStatus,
  unitStatus: string,
  notes?: string,
  resolvedById?: string,
) {
  try {
    const breakdown = await prisma.breakdown.findUnique({
      where: { id },
      include: { unit: true },
    });

    if (!breakdown) {
      return { success: false, message: "Breakdown not found!" };
    }

    // Update breakdown status dan unit status dalam satu transaction
    await prisma.$transaction(async (tx) => {
      // Update breakdown status
      const updateData: any = { status };

      if (status === "in_progress" && resolvedById) {
        updateData.inProgressById = resolvedById;
        updateData.inProgressAt = new Date();
      }

      await tx.breakdown.update({
        where: { id },
        data: updateData,
      });

      // Update unit status
      await tx.unit.update({
        where: { id: breakdown.unitId },
        data: { status: unitStatus },
      });

      // Create history log untuk breakdown
      await tx.unitHistory.create({
        data: {
          logType: "status_update",
          referenceId: breakdown.id,
          message: `Breakdown ${breakdown.breakdownNumber} marked as in progress. Unit status updated to ${unitStatus}.${notes ? ` Notes: ${notes}` : ""}`,
          unitId: breakdown.unitId,
        },
      });

      // Create history log untuk unit status change
      await tx.unitHistory.create({
        data: {
          logType: "unit_status_change",
          referenceId: breakdown.id,
          message: `Unit status changed to ${unitStatus} due to breakdown ${breakdown.breakdownNumber}.${notes ? ` Notes: ${notes}` : ""}`,
          unitId: breakdown.unitId,
        },
      });
    });

    revalidatePath("/dashboard/gamma");

    return {
      success: true,
      message: `Breakdown marked as in progress and unit status updated to ${unitStatus}.`,
    };
  } catch (error) {
    console.error("Error updating breakdown status with unit status:", error);

    return { success: false, message: "Failed to update status." };
  }
}
