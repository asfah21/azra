"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users } from "lucide-react";

import UserCardGrids from "./components/CardGrid";
import UserTables from "./components/UserTable";

import { CardGridSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function UsersClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users-data"],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/users");

      return res.data.data;
    },
    refetchInterval: 5000,
  });

  const allUsers = data?.users || [];
  const userStats = data?.stats || {
    total: 0,
    new: 0,
    active: 0,
    inactive: 0,
  };

  // Konversi tanggal ke Date object
  const usersTable = allUsers.map((user: any) => ({
    ...user,
    createdAt: new Date(user.createdAt),
    lastActive: user.lastActive ? new Date(user.lastActive) : null,
  }));

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

      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <UserCardGrids stats={userStats} />
        </div>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data users.
        </div>
      ) : (
        <UserTables usersTable={usersTable} />
      )}
    </div>
  );
}
