"use client";

import { useWorkOrders } from "../hooks/useWorkOrders";
import GammaCardGrid from "./CardGrid";
import { BreakdownStats } from "../types";

interface RealTimeStatsProps {
  initialStats: BreakdownStats;
}

export default function RealTimeStats({ initialStats }: RealTimeStatsProps) {
  const { stats, isLoading } = useWorkOrders();

  // Gunakan initial data jika SWR masih loading
  const displayStats = isLoading ? initialStats : stats;

//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
//         <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
//         <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
//         <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
//         <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
//       </div>
//     );
//   }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <GammaCardGrid stats={displayStats} />
    </div>
  );
} 