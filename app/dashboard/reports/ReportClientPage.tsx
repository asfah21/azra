"use client";

import { BarChart3, Search } from "lucide-react";
import { Input } from "@heroui/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import ListReportButton from "./components/ListReportButton";
import TableReport from "./components/TableReport";

// Simple fetch function for recent activities
const fetchRecentActivities = async () => {
  const response = await axios.get("/api/dashboard/recent-activities");

  return response.data?.data || response.data;
};

export default function ReportClientPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Use React Query to fetch recent activities
  const {
    data: recentActivities = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: fetchRecentActivities,
    refetchInterval: 30000, // Auto refresh every 30 seconds
    staleTime: 25000, // Data fresh for 25 seconds
    retry: 2, // Retry max 2 times
    refetchOnWindowFocus: false,
  });

  const handleRetry = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Reports
          </h1>
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

      {/* Mobile search input */}
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

      {/* List Report Button */}
      <ListReportButton loading={loading} searchQuery={searchQuery} />
      <TableReport
        error={error?.message || null}
        loading={loading}
        recentActivities={recentActivities}
        onRetry={handleRetry}
      />
    </div>
  );
}
