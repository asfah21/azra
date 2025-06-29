"use client";

import { useOptimistic, startTransition } from "react";
import { BreakdownPayload } from "../types";
import { convertBreakdownData } from "../hooks/useWorkOrders";
import {
  updateBreakdownStatusWithActions,
  updateBreakdownStatusWithUnitStatus,
  deleteBreakdown,
} from "../action";

export function useOptimisticWorkOrders(initialWorkOrders: BreakdownPayload[]) {
  const [optimisticWorkOrders, addOptimisticWorkOrder] = useOptimistic(
    initialWorkOrders,
    (state, newWorkOrder: Partial<BreakdownPayload>) => {
      return state.map((workOrder) => {
        if (workOrder.id === newWorkOrder.id) {
          // Pastikan data yang diupdate tetap memiliki Date objects
          const updatedWorkOrder = { ...workOrder, ...newWorkOrder };
          return convertBreakdownData(updatedWorkOrder);
        }
        return workOrder;
      });
    }
  );

  const optimisticUpdateStatus = async (
    id: string,
    status: "pending" | "in_progress" | "rfu" | "overdue",
    resolvedById?: string
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
        resolvedById
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
    resolvedById?: string
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
        resolvedById
      );
      return result;
    } catch (error) {
      console.error("Error updating with unit status:", error);
      throw error;
    }
  };

  const optimisticDelete = async (id: string) => {
    startTransition(() => {
      addOptimisticWorkOrder({ id, status: "deleted" as any });
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