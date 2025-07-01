"use client";

import { AssetStats } from "../types";

import AssetCardGrids from "./CardGrid";

interface RealTimeStatsProps {
  initialStats: AssetStats;
}

export default function RealTimeStats({ initialStats }: RealTimeStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <AssetCardGrids stats={initialStats} />
    </div>
  );
}
