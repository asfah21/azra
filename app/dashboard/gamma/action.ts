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

// Fungsi untuk generate nomor breakdown berikutnya
export async function getNextBreakdownNumber(role: string) {
  const prefix =
    role === "super_admin" || role === "admin_elec" ? "WOIT-" : "WO-";
  // Cari nomor terakhir dengan prefix yang sesuai
  const last = await prisma.breakdown.findFirst({
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
  resolvedById?: string, // Tambahkan parameter untuk user yang menandai RFU
) {
  try {
    const updatedBreakdown = await prisma.breakdown.update({
      where: { id },
      data: { status },
      include: { unit: true },
    });

    // Jika status adalah RFU dan ada resolvedById, buat RFUReport
    if (status === "rfu" && resolvedById) {
      await prisma.rFUReport.create({
        data: {
          solution: "Marked as RFU by user", // Default solution
          breakdownId: id,
          resolvedById: resolvedById,
        },
      });
    }

    await prisma.unitHistory.create({
      data: {
        logType: "status_update",
        referenceId: updatedBreakdown.id,
        message: `Status for breakdown ${updatedBreakdown.breakdownNumber} on unit ${updatedBreakdown.unit.name} updated to ${status}.`,
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
