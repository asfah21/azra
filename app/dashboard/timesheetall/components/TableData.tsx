// TableData for timesheetall, identical to timesheetlist
// You can customize columns if needed

"use client";
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, CardBody, Divider, Chip, Input, Pagination, Button } from "@heroui/react";
import { Edit, Package, Search } from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import Activity from "./Activity";
import { Modal, ModalContent } from "@heroui/react";

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
}

export default function TableDatas({ timesheetData }: { timesheetData: TimesheetEntry[] }) {
  // State for delete activity modal
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteActivity, setDeleteActivity] = React.useState<any | null>(null);
  const [deletingActivityId, setDeletingActivityId] = React.useState<string | null>(null);
  // State for edit modal
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editActivity, setEditActivity] = React.useState<any | null>(null);

  // State for Activity modal fields
  const [editProject, setEditProject] = React.useState("");
  const [editTask, setEditTask] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editTag, setEditTag] = React.useState("");
  const [editDuration, setEditDuration] = React.useState("");
  const [editStartTime, setEditStartTime] = React.useState("");
  const [editEndTime, setEditEndTime] = React.useState("");
  const [editDate, setEditDate] = React.useState(new Date());
  // Ambil nama user dari session auth
  const sessionUser = useSessionUser();
  const currentUserName = sessionUser?.name || 'Admin';

  // Approve handler
  const handleApprove = async (entry: TimesheetEntry) => {
    const timeEntryId = entry.timeEntryId ? entry.timeEntryId : entry.id;
    const approveUrl = `/api/timesheetall/${timeEntryId}`;
    try {
      const response = await fetch(approveUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: currentUserName })
      });
      if (response.ok) {
        // Update local state
        setLocalData(prev => prev.map(e =>
          (e.timeEntryId ?? e.id) === timeEntryId ? { ...e, approvedBy: currentUserName } : e
        ));
      } else {
        console.error('Approve failed:', await response.text());
      }
    } catch (err) {
      console.error('Error approving:', err);
    }
  };
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  // Keep a local copy so we can update UI without reloading the page
  const [localData, setLocalData] = React.useState<TimesheetEntry[]>(timesheetData);

  React.useEffect(() => {
    setLocalData(timesheetData);
  }, [timesheetData]);

  const handleDelete = async (entry: TimesheetEntry) => {
    const timeEntryId = entry.timeEntryId ? entry.timeEntryId : entry.id;
    const deleteUrl = `/api/timesheetall/${timeEntryId}`;
    console.log('DELETE URL:', deleteUrl); // Log the constructed URL
    setDeletingId(timeEntryId);
    try {
      const response = await fetch(deleteUrl, { method: 'DELETE' });
      if (response.ok) {
        // Remove all activities that belong to the deleted timeEntry from local state
        setLocalData(prev => prev.filter(e => (e.timeEntryId ?? e.id) !== timeEntryId));
        setDeletingId(null);
      } else {
        console.error('Delete failed:', await response.text());
        setDeletingId(null);
      }
    } catch (err) {
      console.error('Error deleting:', err);
      setDeletingId(null);
    }
  };
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
    if (!deferredSearchQuery.trim()) return localData;
    const query = deferredSearchQuery.toLowerCase();
    return localData.filter((entry) =>
      entry.activity.toLowerCase().includes(query) ||
      entry.activityDesc.toLowerCase().includes(query) ||
      (entry.location?.toLowerCase().includes(query) ?? false)
    );
  }, [localData, deferredSearchQuery]);

  // Sort by startTime descending
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [filteredData]);

  // Group activities by timeEntryId
  const grouped = React.useMemo(() => {
    const map = new Map<string, TimesheetEntry[]>();
    for (const entry of sortedData) {
      const tid = entry.timeEntryId || entry.id;
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid)!.push(entry);
    }
    return Array.from(map.entries());
  }, [sortedData]);

  const totalPages = Math.ceil(grouped.length / ROWS_PER_PAGE);
  const pagedData = grouped.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

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
            <p className="text-small text-default-600">Aktivitas Timesheet Semua User</p>
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
                <TableColumn className="text-center">UNIT</TableColumn>
                <TableColumn className="text-center">USER</TableColumn>
                <TableColumn className="text-center">DATE</TableColumn>
                {/* <TableColumn className="text-center">LOCATION</TableColumn> */}
                <TableColumn className="text-center">SHIFT</TableColumn>
                {/* <TableColumn className="text-center">ACTIVITY</TableColumn> */}
                <TableColumn className="text-center">START</TableColumn>
                <TableColumn className="text-center">END</TableColumn>
                <TableColumn className="text-center">DURATION</TableColumn>
                <TableColumn className="text-center">ACTION</TableColumn>
              </TableHeader>
              <TableBody>
                {pagedData.map(([tid, activities], idx) => {
                  const first = activities[0];
                  return (
                    <>
                      <TableRow key={tid} onClick={() => setSelectedRow(selectedRow === tid ? null : tid)} className={`cursor-pointer transition-colors ${selectedRow === tid ? 'bg-[#27272a]' : ''}`}>
                        <TableCell className="truncate flex items-center py-2 mt-1.5 gap-2 text-center">
                          <span className="ml-2">
                            {selectedRow === tid ? <ChevronUp size={16} className="text-blue-500" /> : <ChevronDown size={18} className="text-gray-400" />}
                          </span>
                          {first.assetTag || '-'}
                        </TableCell>
                        <TableCell className="text-center">{first.userName || '-'}</TableCell>
                        <TableCell className="text-center">{first.shiftDate || '-'}</TableCell>
                        {/* <TableCell className="text-center">{first.location || '-'}</TableCell> */}
                        <TableCell className="text-center">{first.shiftType || '-'}</TableCell>
                        {/* Kolom activity dihapus */}
                        <TableCell className="text-center">{first.startTime ? new Date(first.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</TableCell>
                        <TableCell className="text-center">{first.endTime ? new Date(first.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</TableCell>
                        <TableCell className="text-center">{activities.reduce((sum, a) => sum + (a.durationSec || 0), 0) || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="solid"
                            size="sm"
                            color="success"
                            className="mr-2"
                            onPress={() => handleApprove({ ...first, timeEntryId: tid })}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Approve
                          </Button>
                          <Button
                            variant="solid"
                            size="sm"
                            color="danger"
                            isLoading={deletingId === tid}
                            disabled={deletingId === tid}
                            onPress={() => handleDelete({ ...first, timeEntryId: tid })}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                      {selectedRow === tid && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-default-100 dark:bg-zinc-800 border-none border-default-300 dark:border-zinc-700 rounded-b-lg shadow-lg">
                            <Divider className="mb-2" />
                            <div className="flex items-center pl-2">
                              {/* <ChevronDown size={20} className="text-primary" /> */}
                              <span className="font-semibold text-default-800 dark:text-gray-100">Activity List</span>
                            </div>
                            
                            <div className="flex flex-col gap-2 w-full py-2 pr-2">
                              {[...activities]
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .map(a => (
                                <div key={a.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-default-50 dark:bg-zinc-900 border border-default-200 dark:border-zinc-700 rounded px-3 py-2">
                                  <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
                                    <div className="flex items-center gap-2 mb-1 md:mb-0">
                                      {/* Location icon */}
                                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-red-500"><circle cx="12" cy="10" r="3"/><path d="M12 2C7 2 4 6.5 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-3.5-3-8-8-8z"/></svg>
                                      <span className="text-sm font-semibold text-default-800 dark:text-gray-100">{a.location || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Activity description icon */}
                                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                                      <span className="text-sm text-default-700 dark:text-gray-300">{a.activityDesc || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {/* Time range icon */}
                                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-green-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                      <span className="text-xs text-default-600 dark:text-gray-400">{a.startTime ? new Date(a.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'} - {a.endTime ? new Date(a.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mt-2 md:mt-0">
                                    <button
                                      className="px-2 py-1 rounded text-xs font-medium bg-default-200 dark:bg-zinc-800 text-blue-500 hover:bg-default-300 dark:hover:bg-zinc-700 transition"
                                      title="Edit Activity"
                                      onClick={() => {
                                        setEditActivity(a);
                                        setEditProject(a.activity || "");
                                        setEditTask(a.location || "");
                                        setEditDesc(a.activityDesc || "");
                                        setEditTag(a.assetTag || "");
                                        setEditDuration(a.duration || "");
                                        setEditStartTime(a.startTime ? new Date(a.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "");
                                        setEditEndTime(a.endTime ? new Date(a.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "");
                                        setEditDate(a.shiftDate ? new Date(a.shiftDate) : new Date());
                                        setShowEditModal(true);
                                      }}
                                    >
                                      Edit
                                    </button>
      {/* Modal Edit Activity */}
      <Modal isOpen={showEditModal} placement="center" size="xl" onOpenChange={open => { if (!open) setShowEditModal(false); }}>
        <ModalContent>
          <Activity
            project={editProject}
            setProject={setEditProject}
            task={editTask}
            setTask={setEditTask}
            desc={editDesc}
            setDesc={setEditDesc}
            tag={editTag}
            setTag={setEditTag}
            duration={editDuration}
            setDuration={setEditDuration}
            startTime={editStartTime}
            setStartTime={setEditStartTime}
            endTime={editEndTime}
            setEndTime={setEditEndTime}
            date={editDate}
            editingId={editActivity?.id}
            onClose={() => setShowEditModal(false)}
            onUpdateLocalEntry={(id, updated) => {
              setLocalData(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
              setShowEditModal(false);
            }}
          />
        </ModalContent>
      </Modal>
                                    <button
                                      className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
                                      title="Delete Activity"
                                      onClick={() => {
                                        setDeleteActivity(a);
                                        setShowDeleteModal(true);
                                      }}
                                      disabled={deletingActivityId === a.id}
                                    >
                                      {deletingActivityId === a.id ? 'Deleting...' : 'Delete'}
                                    </button>
      {/* Modal Delete Activity */}
      <Modal isOpen={showDeleteModal} placement="center" size="sm" onOpenChange={open => { if (!open) setShowDeleteModal(false); }}>
        <ModalContent>
          <div className="p-6 flex flex-col items-center">
            <div className="text-lg font-semibold mb-2">Hapus Activity?</div>
            <div className="mb-4 text-center text-default-600">Yakin ingin menghapus activity ini?</div>
            <div className="flex gap-2 justify-center">
              <Button color="danger" isLoading={deletingActivityId === deleteActivity?.id} onPress={async () => {
                setDeletingActivityId(deleteActivity.id);
                try {
                  // Call API to delete activity
                  await fetch(`/api/timesheetall/activity/${deleteActivity.id}`, { method: 'DELETE' });
                  // Remove from local state
                  setLocalData(prev => prev.filter(e => e.id !== deleteActivity.id));
                  setShowDeleteModal(false);
                } catch (err) {
                  // Optionally show error
                } finally {
                  setDeletingActivityId(null);
                }
              }}>Hapus</Button>
              <Button variant="flat" onPress={() => setShowDeleteModal(false)}>Batal</Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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
