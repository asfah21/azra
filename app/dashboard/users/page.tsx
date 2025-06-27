import { Users } from "lucide-react";
import { Metadata } from "next";

import UserCardGrids from "./components/CardGrid";
import UserTables from "./components/UserTable";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export default async function UsersPage() {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
      lastActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Hitung stats dari data yang sudah di-fetch
  const totalUsers = allUsers.length;

  // Hitung new users bulan ini
  const startOfMonth = new Date();

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newUsers = allUsers.filter(
    (user) => user.createdAt >= startOfMonth,
  ).length;

  // Hitung active users (aktif dalam 30 hari terakhir)
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = allUsers.filter(
    (user) => user.lastActive && user.lastActive >= thirtyDaysAgo,
  ).length;

  // Hitung inactive users (tidak aktif dalam 30 hari terakhir atau tidak ada lastActive)
  const inactiveUsers = allUsers.filter(
    (user) => !user.lastActive || user.lastActive < thirtyDaysAgo,
  ).length;

  const userStats = {
    total: totalUsers,
    new: newUsers,
    active: activeUsers,
    inactive: inactiveUsers,
  };

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
        <UserCardGrids stats={userStats} />
      </div>

      {/* Users Table */}
      <UserTables usersTable={allUsers} />
    </div>
  );
}
