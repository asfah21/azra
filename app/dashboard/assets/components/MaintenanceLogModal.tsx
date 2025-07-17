"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Tooltip,
  Avatar,
} from "@heroui/react";
import {
  Wrench,
  User,
  Clock,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Hash,
} from "lucide-react";

interface Unit {
  id: string;
  assetTag: string;
  name: string;
  description: string | null;
  categoryId: number;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  location: string;
  department: string | null;
  manufacturer: string | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  assetValue: number | null;
  utilizationRate: number | null;
  createdAt: Date;
  createdById: string;
  assignedToId: string | null;
}

interface RFUReport {
  id: string;
  solution: string;
  resolvedAt: Date;
  breakdownId: string;
  resolvedById: string;
  workDetails: string | null;
  resolvedBy: {
    name: string;
  };
  actions: RFUReportAction[];
  breakdown: {
    breakdownNumber: string;
    description: string;
    breakdownTime: Date;
    status: string;
  };
}

interface RFUReportAction {
  id: string;
  action: string;
  description: string | null;
  actionTime: Date;
}

interface MaintenanceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Unit | null;
  users: Array<{ id: string; name: string }>;
  onMaintenanceLogged: () => void;
}

export default function MaintenanceLogModal({
  isOpen,
  onClose,
  asset,
  users,
  onMaintenanceLogged,
}: MaintenanceLogModalProps) {
  const [maintenanceLogs, setMaintenanceLogs] = useState<RFUReport[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch maintenance logs when modal opens
  useEffect(() => {
    if (isOpen && asset) {
      fetchMaintenanceLogs();
    }
  }, [isOpen, asset]);

  const fetchMaintenanceLogs = async () => {
    if (!asset) return;

    setLoadingLogs(true);
    try {
      const response = await fetch(
        `/api/maintenance-history?unitId=${asset.id}`,
      );

      if (response.ok) {
        const data = await response.json();

        setMaintenanceLogs(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleClose = () => {
    setMaintenanceLogs([]);
    setLoadingLogs(false);
    onClose();
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rfu":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-primary" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      default:
        return <Clock className="w-4 h-4 text-default-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      rfu: "success",
      pending: "warning",
      in_progress: "primary",
      overdue: "danger",
    } as const;

    return statusColors[status as keyof typeof statusColors] || "default";
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);

      return `${diffInDays} hari yang lalu`;
    }
  };

  if (!asset) return null;

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={handleClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Log Maintenance</h3>
                    <p className="text-sm text-default-500">{asset.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-default-500 pr-6">
                  <Hash className="w-3 h-3" />
                  <span>{asset.assetTag}</span>
                  <MapPin className="w-3 h-3 ml-2" />
                  <span>{asset.location}</span>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="px-6 pb-6">
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-default-500 mt-4">Loading...</p>
                </div>
              ) : maintenanceLogs.length === 0 ? (
                <Card className="bg-default-50 border-dashed">
                  <CardBody className="p-8 text-center">
                    <div className="p-3 bg-default-200 rounded-full w-fit mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-default-400" />
                    </div>
                    <h4 className="text-lg font-medium text-default-600 mb-2">
                      Riwayat tidak ditemukan
                    </h4>
                    <p className="text-sm text-default-500 max-w-sm mx-auto">
                      Data akan muncul setelah WO dinyatakan complete atau RFU
                      (Ready for Use)
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {maintenanceLogs.map((log, index) => (
                    <Card
                      key={log.id}
                      isPressable
                      className="transition-all duration-200 hover:shadow-md cursor-pointer mx-2 justify-center"
                      onPress={() => toggleExpanded(log.id)}
                    >
                      <CardBody className="p-4">
                        {/* Compact Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.breakdown.status)}
                              <Chip
                                className="font-medium"
                                color={
                                  getStatusColor(log.breakdown.status) as any
                                }
                                size="sm"
                                variant="flat"
                              >
                                {log.breakdown.status.toUpperCase()}
                              </Chip>
                            </div>
                            <Chip
                              className="font-mono mr-4"
                              color="primary"
                              size="sm"
                              variant="flat"
                            >
                              {log.breakdown.breakdownNumber}
                            </Chip>
                          </div>

                          <div className="flex items-center gap-3">
                            <Tooltip content={formatDate(log.resolvedAt)}>
                              <div className="text-right">
                                <p className="text-xs text-default-500">
                                  Selesai
                                </p>
                                <p className="text-xs">
                                  {formatTimeAgo(log.resolvedAt)}
                                </p>
                              </div>
                            </Tooltip>
                            <ChevronDown
                              className={`w-4 h-4 text-default-400 transition-transform duration-200 ${
                                expandedItems.has(log.id) ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Always visible summary */}
                        <div className="mb-3">
                          <p className="text-sm text-default-600 line-clamp-2">
                            <span className="font-medium">Masalah:</span>{" "}
                            {log.breakdown.description}
                          </p>
                        </div>

                        {/* Expandable details with consistent height */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedItems.has(log.id)
                              ? "max-h-[1000px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="space-y-4 pt-3 border-t border-default-200">
                            {/* Breakdown Timeline */}
                            <div className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
                              <div className="p-2 bg-primary-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">
                                  Timeline
                                </p>
                                <div className="space-y-1 text-xs text-default-600">
                                  <p>
                                    <span className="font-medium">
                                      Waktu WO:
                                    </span>{" "}
                                    {formatDate(log.breakdown.breakdownTime)}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      Selesai:
                                    </span>{" "}
                                    {formatDate(log.resolvedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Solution */}
                            <div className="flex items-start gap-3 p-3 bg-success-50 rounded-lg">
                              <div className="p-2 bg-success-100 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-success" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1 text-success-700">
                                  Solusi
                                </p>
                                <p className="text-sm text-success-800">
                                  {log.solution}
                                </p>
                              </div>
                            </div>

                            {/* Work Details */}
                            {log.workDetails && (
                              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1 text-primary-700">
                                    Detail Pekerjaan
                                  </p>
                                  <p className="text-sm text-primary-800">
                                    {log.workDetails}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            {log.actions.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-warning" />
                                  <span className="text-sm font-medium">
                                    Aksi yang Dilakukan
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {log.actions.map((action) => (
                                    <div
                                      key={action.id}
                                      className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg"
                                    >
                                      <div className="p-1 bg-warning-100 rounded">
                                        <DollarSign className="w-3 h-3 text-warning" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="text-sm font-medium text-warning-800">
                                            {action.action}
                                          </p>
                                          <span className="text-xs text-warning-600">
                                            {formatDate(action.actionTime)}
                                          </span>
                                        </div>
                                        {action.description && (
                                          <p className="text-sm text-warning-700">
                                            {action.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resolved By */}
                            <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  className="bg-primary-100 text-primary"
                                  name={log.resolvedBy.name}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    RFU oleh
                                  </p>
                                  <p className="text-xs text-default-500">
                                    {log.resolvedBy.name}
                                  </p>
                                </div>
                              </div>
                              {/* <p className="text-xs">
                                ID: {log.resolvedById}
                              </p> */}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="pt-4 px-6">
              <Button
                className="font-medium"
                color="danger"
                variant="light"
                onPress={handleClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
