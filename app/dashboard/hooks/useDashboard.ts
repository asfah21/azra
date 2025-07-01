"use client";

import { useEffect, useState } from "react";

// Types untuk dashboard data
export interface DashboardData {
  assetStats: {
    total: number;
    active: number;
    maintenance: number;
    critical: number;
  };
  workOrderStats: {
    total: number;
    pending: number;
    inProgress: number;
    rfu: number;
    overdue: number;
  };
  monthlyBreakdowns: Array<{
    month: string;
    count: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  maintenancePerformance: Array<{
    department: string;
    completionRate: number;
  }>;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  type: string;
  createdAt: Date;
}

export function useDashboard(
  initialDashboardData: DashboardData,
  initialRecentActivities: RecentActivity[],
) {
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(initialDashboardData);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    initialRecentActivities,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Gunakan initial data dari server-side rendering
  useEffect(() => {
    setDashboardData(initialDashboardData);
    setRecentActivities(initialRecentActivities);
  }, [initialDashboardData, initialRecentActivities]);

  // Optional: Manual refresh function
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Jika perlu refresh data, bisa implement di sini
      // Misalnya dengan memanggil server action atau API
      console.log("Manual refresh - implement if needed");
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to refresh data"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData,
    recentActivities,
    isLoading,
    error,
    mutate: refreshData,
  };
}
