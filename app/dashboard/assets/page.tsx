import { Suspense } from "react";
import { Package } from "lucide-react";
import { Metadata } from "next";

import AssetCardGrids from "./components/CardGrid";
import TableDatas from "./components/TableData";
import { getAssetsData } from "./action";
import { AssetSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Manage assets and view statistics",
};

async function AssetsContent() {
  const { assetStats, allAssets, users } = await getAssetsData();

  return (
    <>
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
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
      </div> */}

      {/* Stats Cards */}
      <AssetCardGrids stats={assetStats} />

      {/* Assets Table */}
      <TableDatas dataTable={allAssets} users={users} />
    </>
  );
}

export default function AssetsPage() {
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

      <Suspense fallback={<AssetSkeleton />}>
        <AssetsContent />
      </Suspense>
    </div>
    
  );
}
