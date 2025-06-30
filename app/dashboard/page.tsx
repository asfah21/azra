import { getServerSession } from "next-auth"; // untuk autentikasi

import { getDashboardData, getRecentActivities } from "./action";

import { authOptions } from "@/lib/auth";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return null;

  // Fetch data untuk initial load (SSE akan mengambil alih setelah hydration)
  const dashboardData = await getDashboardData();
  const recentActivities = await getRecentActivities();

  return (
    <DashboardContent
      initialDashboardData={dashboardData}
      initialRecentActivities={recentActivities}
      user={user}
    />
  );
}
