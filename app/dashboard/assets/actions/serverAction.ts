"use server";

import { prisma } from "@/lib/prisma";

// Fungsi untuk mengambil data assets dan stats
export async function getAssetsData() {
  try {
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

    // Konversi data untuk memastikan tipe yang benar
    const processedAssets = allAssets.map(asset => ({
      ...asset,
      breakdowns: asset.breakdowns.map(breakdown => ({
        id: breakdown.id,
        status: breakdown.status,
        priority: breakdown.priority,
      })),
    }));

    // Hitung stats dari data yang sudah di-fetch
    const totalAssets = processedAssets.length;

    // Hitung new assets bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newAssets = processedAssets.filter(
      (asset) => asset.createdAt >= startOfMonth,
    ).length;

    // Hitung active assets (operational dan dalam kondisi baik)
    const activeAssets = processedAssets.filter(
      (asset) =>
        asset.status?.toLowerCase() === "operational" &&
        (asset.condition?.toLowerCase() === "good" ||
          asset.condition?.toLowerCase() === "excellent" ||
          !asset.condition),
    ).length;

    // Hitung assets dalam maintenance (status maintenance atau ada breakdown aktif)
    const maintenanceAssets = processedAssets.filter(
      (asset) => asset.status === "maintenance" || asset.breakdowns.length > 0,
    ).length;

    // Hitung critical assets (kondisi buruk atau breakdown dengan priority tinggi)
    const criticalAssets = processedAssets.filter(
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      allAssets: processedAssets,
      assetStats,
      users,
    };
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Failed to fetch assets data");
  }
} 