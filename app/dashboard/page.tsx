import {
  getDashboardData,
  getRecentActivities,
} from "@/lib/dashboard/dashboard";
import DashboardContent from "@/components/ui/dashboard/DashboardContent";

export default async function DashboardPage() {
  try {
    // Fetch data untuk initial load (SSR) tanpa dependency session
    const dashboardData = await getDashboardData();
    const recentActivities = await getRecentActivities();

    // Mock user data untuk kompatibilitas
    const mockUser = {
      id: "system",
      name: "System User",
      email: "system@example.com",
      role: "admin_heavy" as const,
    };

    return (
      <DashboardContent
        initialDashboardData={dashboardData}
        initialRecentActivities={recentActivities}
        user={mockUser}
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
