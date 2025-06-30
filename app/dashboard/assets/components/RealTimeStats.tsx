"use client";

import { useAssets } from "../hooks/useAssets";
import { AssetStats } from "../types";

import AssetCardGrids from "./CardGrid";

interface RealTimeStatsProps {
  initialStats: AssetStats;
}

export default function RealTimeStats({ initialStats }: RealTimeStatsProps) {
  const { stats, isLoading } = useAssets();

  // Gunakan initial data jika SWR masih loading
  const displayStats = isLoading ? initialStats : stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <AssetCardGrids stats={displayStats} />
    </div>
  );
} 