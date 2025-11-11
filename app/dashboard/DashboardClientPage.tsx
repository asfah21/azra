"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LayoutDashboardIcon } from "lucide-react";

import DashboardFooter from "./components/DashboardFooter";

import GuestDashboardContent from "@/components/ui/dashboard/guest/GuestDashboardContent";

// Simple fetch function
const fetchDashboard = async () => {
  const [dashboardRes] = await Promise.all([axios.get("/api/dashboard")]);

  return {
    dashboardData: dashboardRes.data?.data || dashboardRes.data,
  };
};

export default function DashboardClientPage({ user }: { user: any }) {
  const role = user?.role as string | undefined;
  const isSuper = role === "super_admin";
  const canHeavy = role === "admin_heavy" || isSuper;
  const canElec = role === "admin_elec" || isSuper;
  const canGuest = role === "guest" || isSuper;

  // enable query if any dashboard will be shown
  const enabled = canHeavy || canElec || canGuest;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-main", role],
    queryFn: fetchDashboard,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  });

  if (!enabled) return null;

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

      {/* Content based on role */}
      <div className="space-y-8">
        {/* {canHeavy && (
          <DashboardContent
            dashboardData={data?.dashboardData}
            error={error?.message}
            loading={isLoading}
            user={user}
            onRetry={refetch}
          />
        )}

        {canElec && (
          <AdminElecDashboardContent
            dashboardData={data?.dashboardData}
            user={user}
          />
        )} */}

        {canGuest && (
          <GuestDashboardContent
            dashboardData={data?.dashboardData}
            user={user}
          />
        )}
      </div>

      <DashboardFooter className="mt-10 mb-[-10px] md:mb-[-30px]" />
    </div>
  );
}
