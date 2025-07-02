"use client";

import {
  BarChart3,
  FileDown,
  ListChecks,
  ClipboardList,
  Users,
  Wrench,
  Layers,
  Package,
  Search,
} from "lucide-react";
import { Input } from "@heroui/react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import UnderMaintenanceModal from "./components/UnderMaintenanceModal";

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
    key: "readiness",
    title: "Ketersediaan Asset",
    desc: "Laporan unit ready di setiap lokasi/unit.",
    icon: <Layers className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
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
    key: "users",
    title: "List User",
    desc: "Laporan daftar pengguna sistem beserta perannya.",
    icon: <Users className="w-7 h-7 text-green-600 dark:text-green-400" />,
  },
];

export default function ReportsPage() {
  // State untuk search
  const [searchQuery, setSearchQuery] = useState("");
  // State untuk modal maintenance
  const [showModal, setShowModal] = useState(false);

  // Tampilkan modal saat page diakses
  useEffect(() => {
    setShowModal(true);
  }, []);

  // Handler untuk menutup modal
  const handleCloseModal = () => setShowModal(false);

  // Handler untuk search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Filter reports berdasarkan search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return reports;
    }

    const query = searchQuery.toLowerCase();

    return reports.filter((report) => {
      return (
        report.title.toLowerCase().includes(query) ||
        report.desc.toLowerCase().includes(query) ||
        report.key.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Modal Under Maintenance */}
      <UnderMaintenanceModal open={showModal} onClose={() => setShowModal(false)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Reports
            </h1>
          </div>
        </div>
        <Input
          className="hidden sm:flex w-64"
          placeholder="Search reports..."
          size="sm"
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={searchQuery}
          variant="flat"
          onValueChange={handleSearchChange}
        />
      </div>

      {/* Search input untuk mobile */}
      <div className="px-0 pb-4 sm:hidden">
        <Input
          placeholder="Search reports..."
          size="sm"
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={searchQuery}
          variant="flat"
          onValueChange={handleSearchChange}
        />
      </div>

      {/* List Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
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
            <Link
              download
              className="btn btn-primary btn-sm flex items-center gap-1"
              href={`/api/reports/${report.key}/download`}
            >
              <FileDown className="text-success w-4 h-4" /> XLS
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
