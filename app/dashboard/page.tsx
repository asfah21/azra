import { getServerSession } from "next-auth";

import {
  getDashboardData,
  getRecentActivities,
} from "@/lib/dashboard/dashboard";
import { authOptions } from "@/lib/auth";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default async function DashboardPage() {
  try {
    // Coba ambil session terlebih dahulu
    let user: any;
    
    try {
      const session = await getServerSession(authOptions);
      user = session?.user || {
        id: "system",
        name: "System User",
        email: "system@example.com",
        role: "admin_heavy" as const,
      };
    } catch (sessionError) {
      console.warn("Session error, using fallback:", sessionError);
      user = {
        id: "system",
        name: "System User",
        email: "system@example.com",
        role: "admin_heavy" as const,
      };
    }

    // Fetch data untuk initial load (SSR)
    const dashboardData = await getDashboardData();
    const recentActivities = await getRecentActivities();

    return (
      <DashboardContent
        initialDashboardData={dashboardData}
        initialRecentActivities={recentActivities}
        user={user}
      />
    );
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    return (
      <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p>Gagal memuat halaman Dashboard.</p>
      </div>
    );
  }
}
