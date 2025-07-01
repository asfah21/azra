import { Users } from "lucide-react";
import { Metadata } from "next";

import RealTimeUserStats from "./components/RealTimeUserStats";
import RealTimeUserTable from "./components/RealTimeUserTable";
import { getUsersData } from "./action";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export default async function UsersPage() {
  // Server-side data untuk initial load (SSR)
  const result = await getUsersData();
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
}