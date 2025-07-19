import { getServerSession } from "next-auth";

import DashboardClientPage from "./DashboardClientPage";

import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return null;

  return <DashboardClientPage user={user} />;
}
