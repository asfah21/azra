"use client"
import { TimesheetListSkeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LuList } from "react-icons/lu";
import DashboardFooter from "../components/DashboardFooter";
import TableDatas from "./components/TableData";

export default function TimesheetListClientPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timentry-list"],
    queryFn: async () => {
      const res = await axios.get(`/api/timesheetall`);
      // API returns { entries }, flatten activities for table
      if (res.data && Array.isArray(res.data.entries)) {
        return res.data.entries;
      }
      return [];
    },
    refetchInterval: 10000,
  });

  // Data timesheet: flat activities from timentry
  const timesheetEntries = Array.isArray(data) ? data : [];

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <LuList className="w-6 h-6 text-primary-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Timesheet List
        </h1>
      </div>

      {isLoading ? (
        <TimesheetListSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data timesheet.
        </div>
      ) : (
        <TableDatas timesheetData={timesheetEntries} />
      )}
      <DashboardFooter className="mt-10 mb-[-10px] md:mb-[-30px]" />
    </div>
  );
}
