"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import DashboardContent from "@/components/ui/dashboard/DashboardContent";
import { LayoutDashboardIcon } from "lucide-react";

export default function DashboardClientPage({ user }: { user: any }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-main"],
    queryFn: async () => {
      const [dashboardRes, activitiesRes] = await Promise.all([
        axios.get("/api/dashboard").then((res) => res.data.data), // <-- ambil .data
        axios.get("/api/dashboard/recent-activities").then((res) => res.data),
      ]);

      return { dashboardData: dashboardRes, recentActivities: activitiesRes };
    },
    refetchInterval: 30000, // polling setiap 30 detik
  });

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <LayoutDashboardIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
        </div>
      </div>

    <DashboardContent
      dashboardData={data?.dashboardData}
      error={error?.message}
      loading={isLoading}
      recentActivities={data?.recentActivities}
      user={user}
      onRetry={refetch}
    />
    </div>
  );
}
