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
  Divider,
} from "@heroui/react";
import { Wrench, User, Clock, DollarSign } from "lucide-react";

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

  const getStatusColor = (status: string) => {
    const statusColors = {
      rfu: "success",
      pending: "warning",
      in_progress: "primary",
      overdue: "danger",
    } as const;

    return statusColors[status as keyof typeof statusColors] || "default";
  };

  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      placement="top-center"
      size="4xl"
      onOpenChange={handleClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <span>Riwayat Maintenance - {asset.name}</span>
              </div>
              <p className="text-sm text-default-500">
                Asset Tag: {asset.assetTag} | Lokasi: {asset.location}
              </p>
            </ModalHeader>
            <ModalBody>
              {loadingLogs ? (
                <div className="text-center py-8">
                  <p className="text-default-500">
                    Loading riwayat maintenance...
                  </p>
                </div>
              ) : maintenanceLogs.length === 0 ? (
                <Card className="bg-default-50">
                  <CardBody className="p-8 text-center">
                    <Wrench className="w-12 h-12 text-default-300 mx-auto mb-4" />
                    <p className="text-default-500 text-lg mb-2">
                      Belum ada riwayat maintenance
                    </p>
                    <p className="text-default-400 text-sm">
                      Riwayat maintenance akan muncul setelah ada breakdown yang
                      diselesaikan (RFU)
                    </p>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {maintenanceLogs.map((log) => (
                    <Card key={log.id} className="bg-default-50">
                      <CardBody className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Chip
                              color={
                                getStatusColor(log.breakdown.status) as any
                              }
                              size="sm"
                              variant="flat"
                            >
                              {log.breakdown.status.toUpperCase()}
                            </Chip>
                            <span className="text-xs text-default-500">
                              #{log.breakdown.breakdownNumber}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-default-500">
                              Diselesaikan
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(log.resolvedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown Info */}
                        <div className="mb-3 p-3 bg-default-100 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-default-500" />
                            <span className="text-sm font-medium">
                              Breakdown Info
                            </span>
                          </div>
                          <p className="text-sm text-default-600 mb-1">
                            <span className="font-medium">
                              Waktu Breakdown:
                            </span>{" "}
                            {formatDate(log.breakdown.breakdownTime)}
                          </p>
                          <p className="text-sm text-default-600">
                            <span className="font-medium">Deskripsi:</span>{" "}
                            {log.breakdown.description}
                          </p>
                        </div>

                        {/* Solution */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">Solusi</span>
                          </div>
                          <p className="text-sm text-default-700 bg-success-50 p-3 rounded-lg">
                            {log.solution}
                          </p>
                        </div>

                        {/* Work Details */}
                        {log.workDetails && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">
                                Detail Pekerjaan
                              </span>
                            </div>
                            <p className="text-sm text-default-700 bg-primary-50 p-3 rounded-lg">
                              {log.workDetails}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {log.actions.length > 0 && (
                          <div>
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
                                  className="bg-warning-50 p-3 rounded-lg"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-medium text-default-700">
                                      {action.action}
                                    </p>
                                    <span className="text-xs text-default-500">
                                      {formatDate(action.actionTime)}
                                    </span>
                                  </div>
                                  {action.description && (
                                    <p className="text-sm text-default-600">
                                      {action.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resolved By */}
                        <Divider className="my-3" />
                        <div className="flex items-center justify-between text-xs text-default-500">
                          <span>
                            Diselesaikan oleh:{" "}
                            <span className="font-medium">
                              {log.resolvedBy.name}
                            </span>
                          </span>
                          <span>ID: {log.resolvedById}</span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Tutup
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
