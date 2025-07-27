"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";
import { LayoutDashboardIcon } from "lucide-react";

// Simple fetch function
const fetchDashboard = async () => {
  const [dashboardRes] = await Promise.all([
    axios.get("/api/dashboard"),
   //axios.get("/api/dashboard/recent-activities")
  ]);

  return {
    dashboardData: dashboardRes.data?.data || dashboardRes.data,
    //recentActivities: activitiesRes.data?.data || activitiesRes.data
  };
};

export default function DashboardClientPage({ user }: { user: any }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-main"],
    queryFn: fetchDashboard,
    refetchInterval: 30000, // Auto refresh setiap 30 detik
    staleTime: 25000, // Data fresh selama 25 detik
    retry: 2, // Retry maksimal 2x
    refetchOnWindowFocus: false
  });

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <LayoutDashboardIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      {/* Content */}
      <DashboardContent
        dashboardData={data?.dashboardData}
        error={error?.message}
        loading={isLoading}
        // recentActivities={data?.recentActivities}
        user={user}
        onRetry={refetch}
      />
    </div>
  );
}