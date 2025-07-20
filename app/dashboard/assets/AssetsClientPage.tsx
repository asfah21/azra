"use client";

import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import AssetCardGrids from "./components/CardGrid";
import TableDatas from "./components/TableData";
import { AssetSkeleton } from "@/components/ui/skeleton";

export default function AssetsClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const res = await axios.get("/api/dashboard/assets");
      return res.data;
    },
    refetchInterval: 10000, // polling setiap 10 detik
  });

  const assetStats = data?.assetStats || {
    total: 0,
    new: 0,
    active: 0,
    maintenance: 0,
    critical: 0,
  };
  const allAssets = data?.allAssets || [];
  const users = data?.users || [];

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

      {isLoading ? (
        <AssetSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data asset.
        </div>
      ) : (
        <>
          <AssetCardGrids stats={assetStats} />
          <TableDatas dataTable={allAssets} users={users} />
        </>
      )}
    </div>
  );
}