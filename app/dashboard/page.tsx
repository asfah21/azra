import { getServerSession } from "next-auth";

import { getDashboardData, getRecentActivities } from "./action";

import { authOptions } from "@/lib/auth";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  
  // Server-side data untuk initial load (SSR)
  const dashboardData = await getDashboardData();
  const recentActivities = await getRecentActivities();

  if (!user) return null;

  return (
    <DashboardContent
      initialDashboardData={dashboardData}
      initialRecentActivities={recentActivities}
      user={user}
    />
  );
}
