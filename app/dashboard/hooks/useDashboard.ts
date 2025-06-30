"use client";

import useSWR from "swr";

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

// Optimized fetcher dengan error handling yang lebih baik
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Tambahkan cache control untuk optimasi
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();

  // Konversi string dates ke Date objects untuk recent activities
  if (data.recentActivities) {
    data.recentActivities = data.recentActivities.map((activity: any) => ({
      ...activity,
      createdAt: new Date(activity.createdAt),
    }));
  }

  return data;
};

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<{
    dashboardData: DashboardData;
    recentActivities: RecentActivity[];
  }>("/api/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh setiap 30 detik (lebih optimal untuk dashboard)
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    // Tambahkan error retry
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    // Optimasi untuk data yang tidak terlalu sering berubah
    dedupingInterval: 10000,
  });

  return {
    dashboardData: data?.dashboardData || {
      assetStats: { total: 0, active: 0, maintenance: 0, critical: 0 },
      workOrderStats: { total: 0, pending: 0, inProgress: 0, rfu: 0, overdue: 0 },
      monthlyBreakdowns: [],
      categoryDistribution: [],
      maintenancePerformance: [],
    },
    recentActivities: data?.recentActivities || [],
    isLoading,
    error,
    mutate,
  };
} 