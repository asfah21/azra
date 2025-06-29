import { getServerSession } from "next-auth";

import { getDashboardData, getRecentActivities } from "./action";

import { authOptions } from "@/lib/auth";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const dashboardData = await getDashboardData();
  const recentActivities = await getRecentActivities();

  if (!user) return null;

  return (
    <DashboardContent
      dashboardData={dashboardData}
      recentActivities={recentActivities}
      user={user}
    />
  );
}
