"use client";
import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, CardBody, Divider, Chip, Input, Pagination, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Package, Search, Edit } from "lucide-react";

interface TimesheetEntry {
  id: string;
  userId: string;
  userName?: string;
  activity: string;
  activityDesc: string;
  location?: string;
  shiftDate: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export default function TableDatas({ timesheetData }: { timesheetData: TimesheetEntry[] }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const ROWS_PER_PAGE = 10;

  const handleSearchChange = React.useCallback((value: string) => {
    React.startTransition(() => {
      setSearchQuery(value);
      setPage(1);
    });
  }, []);

  const filteredData = React.useMemo(() => {
    if (!deferredSearchQuery.trim()) return timesheetData;
    const query = deferredSearchQuery.toLowerCase();
    return timesheetData.filter((entry) =>
      entry.activity.toLowerCase().includes(query) ||
      entry.activityDesc.toLowerCase().includes(query) ||
      (entry.location?.toLowerCase().includes(query) ?? false) ||
      entry.shiftDate.toLowerCase().includes(query) ||
      entry.shiftType.toLowerCase().includes(query)
    );
  }, [timesheetData, deferredSearchQuery]);

  // Group data per user per shift
  const groupByUserShift = (data: TimesheetEntry[]) => {
    const groups: Record<string, TimesheetEntry[]> = {};
    data.forEach(entry => {
      const key = `${entry.userId}-${entry.shiftDate}-${entry.shiftType}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return groups;
  };
  const grouped = React.useMemo(() => groupByUserShift(filteredData), [filteredData]);
  const groupKeys = Object.keys(grouped);

  const paginationData = React.useMemo(() => {
    const totalPages = Math.ceil(groupKeys.length / ROWS_PER_PAGE);
    const start = (page - 1) * ROWS_PER_PAGE;
    const items = groupKeys.slice(start, start + ROWS_PER_PAGE);
    return { totalPages, items };
  }, [groupKeys, page]);

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
                {groupKeys.length}
              </Chip>
            </div>
            <p className="text-small text-default-600">Aktivitas Timesheet User</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
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
        {paginationData.items.length === 0 ? (
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
                paginationData.totalPages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={paginationData.totalPages}
                      onChange={handlePageChange}
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>SHIFT</TableColumn>
                <TableColumn>ACTIVITY</TableColumn>
                <TableColumn>ACTION</TableColumn>
              </TableHeader>
              <TableBody>
                {paginationData.items.map((key, idx) => {
                  const entries = grouped[key];
                  const first = entries[0];
                  return (
                    <TableRow key={key}>
                      <TableCell>{first.userName || '-'}</TableCell>
                      <TableCell>{first.location || '-'}</TableCell>
                      <TableCell>{first.shiftType}</TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button variant="flat" size="sm">Lihat Aktivitas</Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Aktivitas List">
                            {entries.map(e => (
                              <DropdownItem key={e.id} className="flex items-center justify-between">
                                <span>{e.activity} - {e.activityDesc}</span>
                                <Button isIconOnly size="sm" variant="light" onPress={() => alert(`Edit ${e.activity}`)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" color="primary" variant="flat" onPress={() => alert(`Edit shift ${first.shiftDate} - ${first.shiftType}`)}>
                          Edit Shift
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}