"use client";

import { Fingerprint } from "lucide-react";
import DashboardFooter from "../components/DashboardFooter";
import FingerTable from "./components/FingerTable";
import FingerCardGrids from "./components/CardGrid";
import { CardGridSkeleton, TableFingerprint } from "@/components/ui/skeleton";
import { useFingerprintStats } from "@/hooks/fingerprint/useCardFingerprints"; 

// ---------------- Main Component ----------------
export default function ClientPage() {
  // Panggil hook
  const { data: userStats, isLoading, isError } = useFingerprintStats();

  const initialStats = {
    type0Today: 0,
    type1Today: 0,
    type0ThisMonth: 0,
    type1ThisMonth: 0,
  };

  const statsToDisplay = userStats ?? initialStats;

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Fingerprint className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Fingerprint
          </h1>
        </div>
      </header>

      {/* Stats Cards */}
      {isLoading ? (
        <CardGridSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat statistik.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <FingerCardGrids stats={statsToDisplay} />
        </div>
      )}

      {/* Table */}
      {/* Catatan: FingerTable saat ini tidak menerima props data, yang mungkin perlu direvisi jika ia harus menampilkan log. */}
      {isLoading ? (
        <TableFingerprint />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data fingerprint.
        </div>
      ) : (
        <FingerTable />
      )}

      <DashboardFooter className="mt-10 mb-[-30px]" />
    </div>
  );
}