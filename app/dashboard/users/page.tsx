import { Users } from "lucide-react";
import { Metadata } from "next";

import RealTimeUserStats from "./components/RealTimeUserStats";
import RealTimeUserTable from "./components/RealTimeUserTable";

import { getUsersData } from "@/lib/dashboard/user";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export default async function UsersPage() {
  try {
    // Server-side data untuk initial load (SSR)
    const result = await getUsersData();
    
    if (!result.success) {
      return (
        <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Gagal mengambil data users</h2>
          <p>{result.message || "Terjadi kesalahan tak terduga."}</p>
        </div>
      );
    }

    const { users: allUsers, stats: userStats } = result.data;

    return (
      <div className="p-0 md:p-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                User Management
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <RealTimeUserStats stats={userStats} />
        </div>

        {/* Users Table */}
        <RealTimeUserTable users={allUsers} />
      </div>
    );
  } catch (error) {
    console.error("Error in UsersPage:", error);
    return (
      <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p>Gagal memuat halaman User Management.</p>
      </div>
    );
  }
}
