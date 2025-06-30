"use client";

import useSWR from "swr";
import { BreakdownPayload, BreakdownStats } from "../types";

// Helper function untuk konversi data
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

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();

  // Konversi string dates ke Date objects
  if (data.allBreakdowns) {
    data.allBreakdowns = data.allBreakdowns.map(convertBreakdownData);
  }

  return data;
};

export function useWorkOrders() {
  const { data, error, isLoading, mutate } = useSWR<{
    allBreakdowns: BreakdownPayload[];
    breakdownStats: BreakdownStats;
  }>("/api/workorders", fetcher, {
    refreshInterval: 5000, // Refresh setiap 5 detik
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    workOrders: data?.allBreakdowns || [],
    stats: data?.breakdownStats || {
      total: 0,
      progress: 0,
      rfu: 0,
      pending: 0,
      overdue: 0,
    },
    isLoading,
    error,
    mutate,
  };
}

// Export helper function untuk digunakan di optimistic actions
export { convertBreakdownData };