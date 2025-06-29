"use client";

import { useWorkOrders } from "../hooks/useWorkOrders";
import GammaTableData from "./TableData";
import { BreakdownPayload } from "../types";

interface RealTimeTableProps {
  initialData: BreakdownPayload[];
}

export default function RealTimeTable({ initialData }: RealTimeTableProps) {
  const { workOrders, isLoading, mutate } = useWorkOrders();

  // Gunakan initial data jika SWR masih loading
  const displayData = isLoading ? initialData : workOrders;

  return <GammaTableData dataTable={displayData} mutate={mutate} />;
} 