"use client";

import { BarChart3, Search } from "lucide-react";
import { Input } from "@heroui/react";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import ListReportButton from "./components/ListReportButton";
import TableReport from "./components/TableReport";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  type: string;
  createdAt: Date;
}

interface ApiResponse {
  success: boolean;
  data: Activity[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    lastUpdated: string;
  };
}

// Fetch function for recent activities with pagination support
const fetchRecentActivities = async ({
  queryKey,
}: {
  queryKey: [string, number, number];
}): Promise<ApiResponse> => {
  const [_, page, limit] = queryKey;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await axios.get<ApiResponse>(
    `/api/dashboard/recent-activities?${params}`,
  );

  return response.data;
};

export default function ReportClientPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0); // 0-indexed page
  const [limit] = useState(10); // Fixed limit per page

  // Use React Query to fetch recent activities
  const {
    data: activitiesResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recent-activities", page, limit],
    queryFn: fetchRecentActivities,
    refetchInterval: 30000, // Auto refresh every 30 seconds
    staleTime: 25000, // Data fresh for 25 seconds
    retry: 2, // Retry max 2 times
    refetchOnWindowFocus: false,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRetry = () => {
    refetch();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page when searching
  };

  // Extract data and metadata from response
  const recentActivities = activitiesResponse?.data || [];
  const totalActivities = activitiesResponse?.metadata?.total || 0;
  const totalPages = Math.ceil(totalActivities / limit);

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
        currentPage={page}
        error={error?.message || null}
        loading={loading}
        recentActivities={recentActivities}
        totalActivities={totalActivities}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onRetry={handleRetry}
      />
    </div>
  );
}
