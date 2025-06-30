import { PaperClipIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

import RealTimeStats from "./components/RealTimeStats";
import RealTimeTable from "./components/RealTimeTable";
import { getBreakdownsData } from "./actions/serverAction";

// Server Component untuk initial load
export const metadata = {
  title: "Work Order",
};

// Skeleton component untuk loading state
function WorkOrderSkeleton() {
  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-32 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      
      {/* Table Skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

// Separate component untuk data fetching
async function WorkOrderContent() {
  try {
    // Server-side data untuk initial load (SSR)
    const { allBreakdowns, breakdownStats } = await getBreakdownsData();

    return (
      <div className="p-0 md:p-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <PaperClipIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Work Order
              </h1>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <RealTimeStats initialStats={breakdownStats} />

        {/* Real-time Table */}
        <RealTimeTable initialData={allBreakdowns} />
      </div>
    );
  } catch (error) {
    console.error("Error loading work orders:", error);
    
    // Return skeleton jika ada error
    return <WorkOrderSkeleton />;
  }
}

export default function WoPage() {
  return (
    <Suspense fallback={<WorkOrderSkeleton />}>
      <WorkOrderContent />
    </Suspense>
  );
}
