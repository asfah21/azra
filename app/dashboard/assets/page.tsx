import { Package } from "lucide-react";
import { Metadata } from "next";

import RealTimeStats from "./components/RealTimeStats";
import RealTimeTable from "./components/RealTimeTable";
import { getAssetsData } from "@/lib/dashboard/asset";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Manage assets and view statistics",
};
// tambahan

export default async function AssetsPage() {
  // Server-side data untuk initial load (SSR)
  const { assetStats, allAssets, users } = await getAssetsData();

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Asset Management
            </h1>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <RealTimeStats initialStats={assetStats} />

      {/* Real-time Table */}
      <RealTimeTable initialData={allAssets} initialUsers={users} />
    </div>
  );
}
