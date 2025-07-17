import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClientPage from "./DashboardClientPage";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) return null;

  return <DashboardClientPage user={user} />;
}
