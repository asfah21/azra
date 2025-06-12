import { Users } from "lucide-react";

import UserCardGrids from "./components/CardGrid";
import UserTables from "./components/UserTable";

import { prisma } from "@/lib/prisma";

async function getTotalUsers(): Promise<number> {
  try {
    const totalUsers = await prisma.user.count();

    return totalUsers;
  } catch (error) {
    // console.error("Error fetching total users:", error);
    throw error;
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

    return newUsers;
  } catch (error) {
    // console.error("Error fetching new users:", error);
    throw error;
  }
}

export default async function UsersPage() {
  // // Fetch semua data secara parallel
  // const [totalUsers, newUsers] = await Promise.all([
  //   getTotalUsers(),
  //   getNewUsers(),
  // ]);

  // Fetch data sequentially
  const totalUsers = await getTotalUsers();
  const newUsers = await getNewUsers();

  const userStats = {
    total: totalUsers,
    new: newUsers,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
        </div>
        <div className="flex gap-2">{/* <RightButtonList /> */}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UserCardGrids stats={userStats} />
      </div>

      {/* Users Table */}
      <UserTables />
    </div>
  );
}
