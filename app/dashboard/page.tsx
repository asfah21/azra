import { getServerSession } from "next-auth";

import { getDashboardData, getRecentActivities } from "./action";

import { authOptions } from "@/lib/auth";
import DashboardContent from "./components/DashboardContent";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return null;

  return (
    <DashboardContent
      user={user}
    />
  );
}
