"use client";

import { useUsers } from "../hooks/useUsers";
import { UserStats } from "../types";

import UserCardGrids from "./CardGrid";

interface RealTimeUserStatsProps {
  initialStats: UserStats;
}

export default function RealTimeUserStats({
  initialStats,
}: RealTimeUserStatsProps) {
  const { stats, isLoading } = useUsers();

  // Gunakan initial stats jika SWR masih loading
  const displayStats = isLoading ? initialStats : stats;

  return <UserCardGrids stats={displayStats} />;
}
