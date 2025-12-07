"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  User,
  Skeleton,
} from "@heroui/react";
import { Search, Upload, UserRoundCheck } from "lucide-react";

import { useFingerprintLogs } from "@/hooks/fingerprint/useFingerprintLogs";
import { useExportFingerprint } from "@/hooks/fingerprint/useExportFingerprint";

type LogEntry = {
  id: number | string;
  user_id?: number | string;
  type?: number;
  device_sn?: string;
  timestamp?: string;
  created_at?: string;
  [key: string]: any;
};

function mapType(t?: number) {
  if (t === 0) return "Masuk";
  if (t === 1) return "Pulang";
  if (t === 4) return "Lembur Masuk";
  if (t === 5) return "Lembur Pulang";

  return String(t ?? "System");
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(iso)) return iso;
  const d = new Date(String(iso));

  if (isNaN(d.getTime())) return String(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
// Tambahkan helper split date/time berbasis formatDate agar konsisten
function splitDateTime(iso?: string) {
  const full = formatDate(iso);

  if (!full || full === "-") return { date: "-", time: "-" };
  const [date, time] = full.split(" ");

  return { date: date ?? "-", time: time ?? "-" };
}

export default function FingerTable() {
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [exportingWhich, setExportingWhich] = useState<
    "today" | "yesterday" | "last7" | "last30" | "all" | null
  >(null);

  // Fetch logs from backend with pagination+search already applied and users joined
  const {
    data,
    isLoading,
    isFetching,
    error,
    usersByFid,
    usersDeptByFid,
    usersNikByFid,
    usersPhotoByFid,
    pageSize,
  } = useFingerprintLogs({ page, search: searchQuery });

  const rows: LogEntry[] = data?.rows ?? [];
  const total: number | null =
    typeof data?.total === "number" ? data!.total : null;
  const totalPages =
    total != null ? Math.max(1, Math.ceil(total / (pageSize || 20))) : null;
  const pages = totalPages ?? Math.max(1, page);

  const resolvePhotoByUserId = useCallback(
    (userId?: string | number) =>
      userId == null ? "" : (usersPhotoByFid[String(userId)] ?? ""),
    [usersPhotoByFid],
  );
  const resolveNameByUserId = useCallback(
    (userId?: string | number) =>
      userId == null ? "-" : (usersByFid[String(userId)] ?? String(userId)),
    [usersByFid],
  );
  const resolveNikByUserId = useCallback(
    (userId?: string | number) =>
      userId == null ? "-" : (usersNikByFid[String(userId)] ?? "-"),
    [usersNikByFid],
  );
  const resolveDeptByUserId = useCallback(
    (userId?: string | number) =>
      userId == null ? "-" : (usersDeptByFid[String(userId)] ?? "-"),
    [usersDeptByFid],
  );

  const {
    isOpen: isExportOpen,
    onOpen: onOpenExport,
    onOpenChange: onExportOpenChange,
  } = useDisclosure();
  const { exporting, exportProgress, exportData } = useExportFingerprint();

  const loading = isLoading || isFetching;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-green-800 rounded-lg flex-shrink-0">
              <UserRoundCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-semibold text-default-800">
                  Attendance
                </h2>
                <Chip
                  className="text-sm font-bold"
                  color="success"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  {typeof total === "number" ? total : 0}
                </Chip>
              </div>
              <p className="text-xs sm:text-small text-default-600">
                Attendance by fingerprint
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Find by Name or User ID ..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={(v: string) => {
                setSearchQuery(v);
                setPage(1);
              }}
            />

            <Button
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<Upload className="w-4 h-4" />}
              variant="flat"
              onPress={onOpenExport}
            >
              Export
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="px-0">
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Find by User ID ..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
              onValueChange={(v: string) => {
                setSearchQuery(v);
                setPage(1);
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <Table
              aria-busy={loading}
              aria-label="Fingerprint logs table"
              bottomContent={
                <div className="flex w-full justify-center py-3">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    isDisabled={loading}
                    page={page}
                    total={pages}
                    onChange={(p: number) => setPage(p)}
                  />
                </div>
              }
              className="min-w-full"
            >
              <TableHeader>
                {/* header styling like UserTable: small uppercase, tight spacing */}
                {/* <TableColumn className="w-12 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  NO
                </TableColumn> */}
                {/* <TableColumn className="w-16 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  PHOTO
                </TableColumn> */}
                {/* <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  NIK
                </TableColumn> */}
                <TableColumn className="w-20 text-center text-xs text-left font-medium text-default-600 uppercase tracking-wider select-none">
                  NAME
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DIVISION
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  TYPE
                </TableColumn>
                <TableColumn className="w-28 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  TIME
                </TableColumn>
                <TableColumn className="w-24 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DATE
                </TableColumn>
                <TableColumn className="w-24 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  FID
                </TableColumn>
                <TableColumn className="w-56 text-center text-xs font-medium text-default-600 uppercase tracking-wider select-none">
                  DEVICE SN
                </TableColumn>
              </TableHeader>

              <TableBody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <TableRow
                        key={`skeleton-${i}`}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="text-left align-left px-2 py-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1 min-w-0">
                              <Skeleton className="h-3 w-32 rounded mb-1" />
                              <Skeleton className="h-3 w-20 rounded" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-3 w-24 rounded mx-auto" />
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-6 w-20 rounded mx-auto" />
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-3 w-16 rounded mx-auto" />
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-3 w-20 rounded mx-auto" />
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-3 w-14 rounded mx-auto" />
                        </TableCell>
                        <TableCell className="text-center align-middle px-6 py-3">
                          <Skeleton className="h-3 w-32 rounded mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : rows.map((item: LogEntry, index: number) => {
                      const idx = (page - 1) * (pageSize || 20) + index + 1;
                      const nameFromUser = (item as any).user?.name as
                        | string
                        | undefined;
                      const deptFromUser = (item as any).user?.department as
                        | string
                        | undefined;
                      const nikFromUser = (item as any).user?.nik as
                        | string
                        | undefined;
                      const photoFromUser = (item as any).user?.photo as
                        | string
                        | undefined;
                      const fidFromUser = (item as any).user?.fid as
                        | string
                        | number
                        | undefined;
                      const resolvedName =
                        nameFromUser ?? resolveNameByUserId(item.user_id);
                      const resolvedDept =
                        deptFromUser ?? resolveDeptByUserId(item.user_id);
                      const resolvedNik =
                        nikFromUser ?? resolveNikByUserId(item.user_id);
                      const resolvedPhoto =
                        photoFromUser ?? resolvePhotoByUserId(item.user_id);
                      const { date: resolvedDate, time: resolvedTime } =
                        splitDateTime(item.timestamp ?? item.created_at);

                      return (
                        <TableRow
                          key={item.id ?? idx}
                          className="hover:bg-default-50"
                        >
                          <TableCell className="text-left align-left px-2 py-3">
                            <User
                              avatarProps={{
                                radius: "lg",
                                src: resolvedPhoto || undefined,
                                className:
                                  "w-8 h-8 rounded-full object-cover flex-shrink-0 truncate",
                              }}
                              classNames={{
                                description: "text-default-500 truncate",
                                name: "font-medium text-default-800 truncate",
                              }}
                              description={resolvedNik}
                              name={resolvedName}
                            />
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                            {resolvedDept || "-"}
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 whitespace-pre-line">
                            <Chip
                              className="mx-auto"
                              color={
                                item.type === 0
                                  ? "success"
                                  : item.type === 1
                                    ? "danger"
                                    : item.type === 4
                                      ? "primary"
                                      : item.type === 5
                                        ? "warning"
                                        : "default"
                              }
                              radius="sm"
                              size="sm"
                              variant="flat"
                            >
                              {mapType(item.type)}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                            {resolvedTime}
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 truncate">
                            <div className="truncate">{resolvedDate}</div>
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700">
                            {fidFromUser ?? item.user_id ?? "-"}
                          </TableCell>
                          <TableCell className="text-center align-middle px-6 py-3 text-sm text-default-700 truncate">
                            {item.device_sn ?? "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Export options modal */}
      <Modal isOpen={isExportOpen} onOpenChange={onExportOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-base flex items-center gap-2">
                Export data
                {exporting ? (
                  <span className="ml-2 text-green-500 text-xs flex items-center gap-1">
                    Processing.. {exportProgress}%
                  </span>
                ) : null}
              </ModalHeader>
              <ModalBody className="gap-2">
                {/* Keep buttons, wire to server-side export */}
                <Button
                  color="primary"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "today"}
                  variant="flat"
                  onPress={async () => {
                    setExportingWhich("today");
                    await exportData({
                      range: "today",
                      search: searchQuery,
                      join: "user",
                    });
                    setExportingWhich(null);
                    onClose();
                  }}
                >
                  Export today
                </Button>
                <Button
                  color="secondary"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "yesterday"}
                  variant="flat"
                  onPress={async () => {
                    setExportingWhich("yesterday");
                    await exportData({
                      range: "yesterday",
                      search: searchQuery,
                      join: "user",
                    });
                    setExportingWhich(null);
                    onClose();
                  }}
                >
                  Export yesterday
                </Button>
                <Button
                  color="warning"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "last7"}
                  variant="flat"
                  onPress={async () => {
                    setExportingWhich("last7");
                    await exportData({
                      range: "last7",
                      search: searchQuery,
                      join: "user",
                    });
                    setExportingWhich(null);
                    onClose();
                  }}
                >
                  Export last 7 days
                </Button>
                <Button
                  color="danger"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "last30"}
                  variant="flat"
                  onPress={async () => {
                    setExportingWhich("last30");
                    await exportData({
                      range: "last30",
                      search: searchQuery,
                      join: "user",
                    });
                    setExportingWhich(null);
                    onClose();
                  }}
                >
                  Export last 30 days
                </Button>
                <Button
                  color="success"
                  isDisabled={exporting}
                  isLoading={exporting && exportingWhich === "all"}
                  variant="flat"
                  onPress={async () => {
                    setExportingWhich("all");
                    await exportData({
                      range: "all",
                      search: searchQuery,
                      join: "user",
                    });
                    setExportingWhich(null);
                    onClose();
                  }}
                >
                  Export all data
                </Button>
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={exporting} variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Total: {total ?? (rows.length > 0 ? "?" : 0)}
          {totalPages
            ? ` — Halaman ${page} dari ${totalPages}`
            : ` — Halaman ${page}`}
        </div>
      </div>

      {error ? (
        <div className="mt-3 text-sm text-danger">{String(error)}</div>
      ) : null}
    </div>
  );
}
