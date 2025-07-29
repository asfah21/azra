"use client";

import { PaperClipIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import CardWo from "./components/CardWo";
import GammaTableData from "./components/TableWo";

import { CardGridSkeleton, TableSkeleton } from "@/components/ui/skeleton";

interface WorkorderClientPageProps {
  initialData?: {
    allBreakdowns: any[];
    breakdownStats: {
      total: number;
      progress: number;
      rfu: number;
      pending: number;
      overdue: number;
    };
  };
}

export default function WorkorderClientPage({
  initialData,
}: WorkorderClientPageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["breakdowns"],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/workorders");

      return res.data;
    },
    refetchInterval: 60000,
    initialData,
  });

  const allBreakdowns = data?.allBreakdowns || [];
  const breakdownStats = data?.breakdownStats || {
    total: 0,
    progress: 0,
    rfu: 0,
    pending: 0,
    overdue: 0,
  };

  return (
    <div className="p-5 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <PaperClipIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Work Order
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <CardWo stats={breakdownStats} />
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data work order.
        </div>
      ) : (
        <GammaTableData dataTable={allBreakdowns} />
      )}
    </div>
  );
}
