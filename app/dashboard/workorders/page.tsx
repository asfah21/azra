import { PaperClipIcon } from "@heroicons/react/24/outline";

import RealTimeStats from "./components/RealTimeStats";
import RealTimeTable from "./components/RealTimeTable";
import { getBreakdownsData } from "./actions/serverAction";

// Server Component untuk initial load
export const metadata = {
  title: "Work Order",
};

export default async function WoPage() {
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
}
