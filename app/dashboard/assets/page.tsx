import { Package } from "lucide-react";
import { Metadata } from "next";

import AssetCardGrids from "./components/CardGrid";
import TableDatas from "./components/TableData";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Asset Management",
  description: "Manage assets and view statistics",
};

export default async function AssetsPage() {
  const allAssets = await prisma.unit.findMany({
    select: {
      id: true,
      assetTag: true,
      name: true,
      description: true,
      categoryId: true,
      status: true,
      condition: true,
      serialNumber: true,
      location: true,
      department: true,
      manufacturer: true,
      installDate: true,
      warrantyExpiry: true,
      lastMaintenance: true,
      nextMaintenance: true,
      assetValue: true,
      utilizationRate: true,
      createdAt: true,
      createdById: true,
      assignedToId: true,
      breakdowns: {
        where: {
          status: {
            in: ["pending", "in_progress"],
          },
        },
        select: {
          id: true,
          status: true,
          priority: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Hitung stats dari data yang sudah di-fetch
  const totalAssets = allAssets.length;

  // Hitung new assets bulan ini
  const startOfMonth = new Date();

  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newAssets = allAssets.filter(
    (asset) => asset.createdAt >= startOfMonth,
  ).length;

  // Hitung active assets (operational dan dalam kondisi baik)
  const activeAssets = allAssets.filter(
    (asset) =>
      asset.status?.toLowerCase() === "operational" &&
      (asset.condition?.toLowerCase() === "good" ||
        asset.condition?.toLowerCase() === "excellent" ||
        !asset.condition),
  ).length;

  // Hitung assets dalam maintenance (status maintenance atau ada breakdown aktif)
  const maintenanceAssets = allAssets.filter(
    (asset) => asset.status === "maintenance" || asset.breakdowns.length > 0,
  ).length;

  // Hitung critical assets (kondisi buruk atau breakdown dengan priority tinggi)
  const criticalAssets = allAssets.filter(
    (asset) =>
      asset.condition === "poor" ||
      asset.condition === "critical" ||
      asset.breakdowns.some(
        (breakdown) =>
          breakdown.priority === "HIGH" || breakdown.priority === "CRITICAL",
      ),
  ).length;

  const assetStats = {
    total: totalAssets,
    new: newAssets,
    active: activeAssets,
    maintenance: maintenanceAssets,
    critical: criticalAssets,
  };

  // Fetch users untuk dropdown (jika diperlukan)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <AssetCardGrids stats={assetStats} />
      </div>

      {/* Assets Table */}
      <TableDatas dataTable={allAssets} users={users} />
    </div>
  );
}
