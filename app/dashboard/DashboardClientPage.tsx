"use client";

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default function DashboardClientPage({ user }: { user: any }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-main'],
    queryFn: async () => {
      const [dashboardRes, activitiesRes] = await Promise.all([
        axios.get('/api/dashboard').then(res => res.data.data), // <-- ambil .data
        axios.get('/api/dashboard/recent-activities').then(res => res.data),
      ]);
      return { dashboardData: dashboardRes, recentActivities: activitiesRes };
    },
    refetchInterval: 30000, // polling setiap 30 detik
  });

  return (
    <DashboardContent
      dashboardData={data?.dashboardData}
      recentActivities={data?.recentActivities}
      user={user}
      loading={isLoading}
      error={error?.message}
      onRetry={refetch}
    />
  );
}