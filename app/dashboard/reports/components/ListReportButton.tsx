"use client";

import {
  FileDown,
  ListChecks,
  ClipboardList,
  Users,
  Wrench,
  Layers,
  Package,
  Loader2,
} from "lucide-react";
import { Card, Skeleton } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GoPulse } from "react-icons/go";

import { VersiApp } from "@/components/ui/ChipVersion";

interface Props {
  searchQuery: string;
  loading?: boolean;
}

export default function ListReportButton({ searchQuery, loading = false }: Props) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleDownload = async (reportKey: string) => {
    try {
      // Set loading state for this specific report
      setLoadingStates(prev => ({ ...prev, [reportKey]: true }));
      
      // Create download URL
      const downloadUrl = `/api/dashboard/report/download?format=excel&type=${reportKey}`;
      
      // Fetch the file
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Report_${reportKey}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      // You could add a toast notification here
      alert('Download failed. Please try again.');
    } finally {
      // Remove loading state
      setLoadingStates(prev => ({ ...prev, [reportKey]: false }));
    }
  };

  const reports = [
    {
      key: "assets",
      title: "List Asset",
      desc: "Laporan berisi daftar seluruh aset/barang beserta detailnya.",
      icon: (
        <Package className="w-7 h-7 text-primary-600 dark:text-primary-400" />
      ),
    },
    {
      key: "users",
      title: "List User",
      desc: "Laporan daftar pengguna beserta perannya.",
      icon: <Users className="w-7 h-7 text-green-600 dark:text-green-400" />,
    },
    {
      key: "workorders",
      title: "List Work Order",
      desc: "Laporan WO yang masuk beserta statusnya.",
      icon: (
        <ClipboardList className="w-7 h-7 text-purple-600 dark:text-purple-400" />
      ),
    },
    {
      key: "maintenance",
      title: "Riwayat Maintenance",
      desc: "Laporan riwayat perawatan dan perbaikan asset / unit.",
      icon: <Wrench className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
    },
    {
      key: "breakdowns",
      title: "Breakdown assets",
      desc: "Laporan kerusakan barang beserta penanganannya.",
      icon: <ListChecks className="w-7 h-7 text-rose-600 dark:text-rose-400" />,
    },
    {
      key: "readiness",
      title: "Ketersediaan Asset",
      desc: "Laporan unit ready di setiap lokasi/unit.",
      icon: <Layers className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
    },
  ];

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;

    const query = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.desc.toLowerCase().includes(query) ||
        r.key.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Skeleton component for loading state
  const ReportButtonSkeleton = () => (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow dark:shadow-none border border-gray-100 dark:border-zinc-800">
      <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl">
        <Skeleton className="w-7 h-7 rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
      <Skeleton className="w-16 h-8 rounded" />
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          // Show skeleton when loading
          Array.from({ length: 6 }).map((_, index) => (
            <ReportButtonSkeleton key={index} />
          ))
        ) : (
          // Show actual reports when not loading
          filteredReports.map((report) => (
          <div
            key={report.key}
            className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow dark:shadow-none border border-gray-100 dark:border-zinc-800 hover:shadow-lg dark:hover:shadow-md transition"
          >
            <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl">
              {report.icon}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                {report.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {report.desc}
              </div>
            </div>
            <button
              onClick={() => handleDownload(report.key)}
              disabled={loadingStates[report.key]}
              className="btn btn-primary btn-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates[report.key] ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  XLS
                </>
              ) : (
                <>
                  <FileDown className="text-success w-4 h-4" /> XLS
                </>
              )}
            </button>
          </div>
          ))
        )}
      </div>

      <Card className="bg-white dark:bg-neutral-900 p-1 my-6">
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-gray-700 dark:text-gray-300 text-center text-base">
            Halaman ini masih dalam tahap{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-300">
              Pengembangan,
            </span>
            &nbsp;beberapa fungsi belum tersedia untuk AZRA <VersiApp /> saat ini.
          </p>
        </div>
      </Card>
    </>
  );
}