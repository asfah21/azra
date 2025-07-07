"use client";

import { useOptimistic, startTransition } from "react";

import { BreakdownPayload, OptimisticBreakdownUpdate } from "../types";

import {
  updateBreakdownStatusWithActions,
  updateBreakdownStatusWithUnitStatus,
  deleteBreakdown,
} from "../action";

// Helper function untuk konversi data (dipindahkan dari useWorkOrders.ts)
const convertBreakdownData = (breakdown: any): BreakdownPayload => ({
  ...breakdown,
  breakdownTime: new Date(breakdown.breakdownTime),
  createdAt: new Date(breakdown.createdAt),
  ...(breakdown.rfuReport && {
    rfuReport: {
      ...breakdown.rfuReport,
      resolvedAt: new Date(breakdown.rfuReport.resolvedAt),
    },
  }),
  ...(breakdown.inProgressAt && {
    inProgressAt: new Date(breakdown.inProgressAt),
  }),
});

export function useOptimisticWorkOrders(initialWorkOrders: BreakdownPayload[]) {
  const [optimisticWorkOrders, addOptimisticWorkOrder] = useOptimistic(
    initialWorkOrders,
    (state, update: OptimisticBreakdownUpdate) => {
      if (update.deleted) {
        return state.filter((workOrder) => workOrder.id !== update.id);
      }

      return state.map((workOrder) => {
        if (workOrder.id === update.id) {
          const updatedWorkOrder = { ...workOrder, ...update };

          return convertBreakdownData(updatedWorkOrder);
        }

        return workOrder;
      });
    },
  );

  const optimisticUpdateStatus = async (
    id: string,
    status: "pending" | "in_progress" | "rfu" | "overdue",
    resolvedById?: string,
  ) => {
    startTransition(() => {
      addOptimisticWorkOrder({ id, status });
    });

    try {
      const result = await updateBreakdownStatusWithActions(
        id,
        status,
        "Solution updated",
        [],
        resolvedById,
      );

      return result;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const optimisticUpdateWithUnitStatus = async (
    id: string,
    status: "pending" | "in_progress" | "rfu" | "overdue",
    unitStatus: string,
    notes?: string,
    resolvedById?: string,
  ) => {
    startTransition(() => {
      addOptimisticWorkOrder({ id, status });
    });

    try {
      const result = await updateBreakdownStatusWithUnitStatus(
        id,
        status,
        unitStatus,
        notes,
        resolvedById,
      );

      return result;
    } catch (error) {
      console.error("Error updating with unit status:", error);
      throw error;
    }
  };

  const optimisticDelete = async (id: string) => {
    startTransition(() => {
      addOptimisticWorkOrder({ id, deleted: true });
    });

    try {
      const result = await deleteBreakdown(id);

      return result;
    } catch (error) {
      console.error("Error deleting work order:", error);
      throw error;
    }
  };

  return {
    optimisticWorkOrders,
    optimisticUpdateStatus,
    optimisticUpdateWithUnitStatus,
    optimisticDelete,
  };
}
