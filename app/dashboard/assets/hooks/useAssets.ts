"use client";

import useSWR from "swr";

import { AssetPayload, AssetStats } from "../types";

// Helper function untuk konversi data
const convertAssetData = (asset: any): AssetPayload => ({
  ...asset,
  installDate: asset.installDate ? new Date(asset.installDate) : null,
  warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry) : null,
  lastMaintenance: asset.lastMaintenance
    ? new Date(asset.lastMaintenance)
    : null,
  nextMaintenance: asset.nextMaintenance
    ? new Date(asset.nextMaintenance)
    : null,
  createdAt: new Date(asset.createdAt),
});

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();

  // Konversi string dates ke Date objects
  if (data.allAssets) {
    data.allAssets = data.allAssets.map(convertAssetData);
  }

  return data;
};

export function useAssets() {
  const { data, error, isLoading, mutate } = useSWR<{
    allAssets: AssetPayload[];
    assetStats: AssetStats;
    users: Array<{ id: string; name: string }>;
  }>("/api/assets", fetcher, {
    refreshInterval: 5000, // Refresh setiap 5 detik
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    assets: data?.allAssets || [],
    stats: data?.assetStats || {
      total: 0,
      new: 0,
      active: 0,
      maintenance: 0,
      critical: 0,
    },
    users: data?.users || [],
    isLoading,
    error,
    mutate,
  };
}

// Export helper function untuk digunakan di optimistic actions
export { convertAssetData };
