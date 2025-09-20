"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, CardBody, Divider, Chip, Input, Pagination, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, SelectItem, Select } from "@heroui/react";
import { Package, Search, Edit } from "lucide-react";

interface TimesheetEntry {
  id: string;
  timeEntryId?: string;
  userId?: string;
  userName?: string;
  activity: string;
  activityDesc: string;
  location?: string;
  shiftDate?: string;
  shiftType?: string;
  startTime: string;
  endTime: string;
  durationSec?: number;
  duration?: string;
  assetTag?: string;
  status?: string;
}

export default function TableDatas({ timesheetData }: { timesheetData: TimesheetEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const ROWS_PER_PAGE = 10;

  const handleSearchChange = React.useCallback((value: string) => {
    React.startTransition(() => {
      setSearchQuery(value);
      setPage(1);
    });
  }, []);

  const filteredData = React.useMemo(() => {
    let data = timesheetData;
    if (statusFilter !== "all") {
      data = data.filter((entry) => {
        if (statusFilter === "open") return entry.status !== "closed";
        if (statusFilter === "closed") return entry.status === "closed";
        return true;
      });
    }
    if (!deferredSearchQuery.trim()) return data;
    const query = deferredSearchQuery.toLowerCase();
    return data.filter((entry) =>
      entry.activity.toLowerCase().includes(query) ||
      entry.activityDesc.toLowerCase().includes(query) ||
      (entry.location?.toLowerCase().includes(query) ?? false)
    );
  }, [timesheetData, deferredSearchQuery, statusFilter]);

  // Sort by startTime descending
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const pagedData = sortedData.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handlePageChange = React.useCallback((newPage: number) => {
    React.startTransition(() => {
      setPage(newPage);
    });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-3 flex-1 justify-start self-start">
          <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-default-800 text-left">Timesheet</p>
              <Chip className="text-sm font-bold" color="success" radius="sm" size="sm" variant="flat">
                {pagedData.length}
              </Chip>
            </div>
            <p className="text-small text-default-600">Aktivitas Timesheet User</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <Input
            className="hidden sm:flex w-64"
            placeholder="Cari aktivitas..."
            size="sm"
            startContent={<Search className="w-4 h-4 text-default-400" />}
            style={{ outline: "none" }}
            value={searchQuery}
            variant="flat"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
            onValueChange={handleSearchChange}
          />
          <Select
            size="sm"
            className="w-32"
            value={statusFilter}
            defaultSelectedKeys={["all"]}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter Status"
          >
            <SelectItem key="all" >All</SelectItem>
            <SelectItem key="open" >Open</SelectItem>
            <SelectItem key="closed" >Closed</SelectItem>
          </Select>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-0">
        <div className="px-6 pb-4 sm:hidden">
          <Input
            placeholder="Cari aktivitas..."
            size="sm"
            startContent={<Search className="w-4 h-4 text-default-400" />}
            style={{ outline: "none" }}
            value={searchQuery}
            variant="flat"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
            onValueChange={handleSearchChange}
          />
        </div>
  {pagedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-default-300 mb-4" />
            <p className="text-default-500">
              {deferredSearchQuery ? "Tidak ada aktivitas ditemukan" : "Belum ada data timesheet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table aria-label="Timesheet table"
              bottomContent={
                totalPages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={totalPages}
                      onChange={handlePageChange}
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>UNIT</TableColumn>
                <TableColumn>USER</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>SHIFT</TableColumn>
                <TableColumn>ACTIVITY</TableColumn>
                <TableColumn>START</TableColumn>
                <TableColumn>END</TableColumn>
                <TableColumn>DURATION</TableColumn>
              </TableHeader>
              <TableBody>
                {pagedData.map((entry, idx) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.assetTag || '-'}</TableCell>
                    <TableCell>{entry.userName || '-'}</TableCell>
                    <TableCell>{entry.shiftDate || '-'}</TableCell>
                    <TableCell>{entry.location || '-'}</TableCell>
                    <TableCell>{entry.shiftType || '-'}</TableCell>
                    <TableCell>{entry.activity || '-'}</TableCell>
                    <TableCell>{entry.startTime ? new Date(entry.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</TableCell>
                    <TableCell>{entry.endTime ? new Date(entry.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</TableCell>
                    <TableCell>{entry.duration || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}