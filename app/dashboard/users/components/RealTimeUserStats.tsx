"use client";

import { UserStats } from "../types";

import UserCardGrids from "./CardGrid";

interface RealTimeUserStatsProps {
  stats: UserStats;
}

export default function RealTimeUserStats({ stats }: RealTimeUserStatsProps) {
  return <UserCardGrids stats={stats} />;
}
