import { Users } from "lucide-react";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

import UserCardGrids from "./components/CardGrid";
import UserTables from "./components/UserTable";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and view statistics",
};

export const revalidate = 180; // 3 menit

async function getTotalUsers(): Promise<number> {
  try {
    const totalUsers = await prisma.user.count();

    console.log(`Successfully fetched ${totalUsers} total users`);

    return totalUsers;
  } catch (error) {
    console.error("Error fetching total users:", error);

    return 0;
  }
}

async function getNewUsers(): Promise<number> {
  try {
    // User yang register bulan ini
    const startOfMonth = new Date();

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    console.log(`Successfully fetched ${newUsers} new users this month`);

    return newUsers;
  } catch (error) {
    console.error("Error fetching new users:", error);

    return 0;
  }
}

type UserListItem = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    department: true;
    createdAt: true;
  };
}>;

async function getUsersTable(): Promise<UserListItem[]> {
  try {
    const usersTable = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    console.log(`Successfully fetched ${usersTable.length} users for table`);

    return usersTable;
  } catch (error) {
    console.error("Error fetching users table:", error);

    return []; // Return empty array instead of throwing
  }
}

export default async function UsersPage() {
  try {
    // Fetch semua data secara parallel untuk performance yang lebih baik
    // const [totalUsers, newUsers, usersTable] = await Promise.all([
    //   getTotalUsers(),
    //   getNewUsers(),
    //   getUsersTable(),
    // ]);

    // Fetch data secara berurutan (sequential)
    const totalUsers = await getTotalUsers();
    const newUsers = await getNewUsers();
    const usersTable = await getUsersTable();

    const userStats = {
      total: totalUsers,
      new: newUsers,
    };

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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
          {/* <div className="flex gap-2"><RightButtonList /></div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <UserCardGrids stats={userStats} />
        </div>

        {/* Main Grid */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <UserMainGrid />
        </div> */}

        {/* Users Table */}
        <UserTables usersTable={usersTable} />
      </div>
    );
  } catch (error) {
    console.error("Error in UsersPage:", error);

    // Fallback UI jika ada error major
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-4 bg-red-50 rounded-xl mb-4">
            <Users className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load User Data
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the user management page. Please try
            refreshing the page.
          </p>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
