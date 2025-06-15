"use client";
import { Package } from "lucide-react";

import AssetCardGrid from "./components/CardGris";
import TableAssets from "./components/TableAsset";

export default function AssetsPage() {
  // Mock data untuk assets

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Asset Management
            </h1>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2">
          <AssetRightButton />
        </div> */}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <AssetCardGrid />
      </div>

      {/* Main Content Grid */}

      {/* <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <MainGridAsset />
      </div> */}

      {/* Asset Inventory Table */}
      <TableAssets />
    </div>
  );
}
