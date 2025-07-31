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
  Avatar,
} from "@heroui/react";
import {
  Wrench,
  Clock,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Hash,
  Lightbulb,
  ClipboardList,
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
    components: {
      component: string;
      subcomponent: string;
    }[];
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
            <ModalHeader className="flex flex-col gap-1 pb-3 px-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary-600 dark:bg-primary-400/30 rounded-lg shadow-sm">
                    <Wrench className="w-5 h-5 text-primary-50 dark:text-primary-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Maintenance Log
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="mr-6 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md text-xs">
                    <Hash className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                    <span className="font-medium">{asset.assetTag}</span>
                  </div>
                  {/* <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md text-xs">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium">{asset.location}</span>
                </div> */}
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="px-5 py-4">
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading maintenance history...
                  </p>
                </div>
              ) : maintenanceLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <Wrench className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No Maintenance Records
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Maintenance logs will appear after completed work orders
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {maintenanceLogs.map((log) => (
                    <Card
                      key={log.id}
                      className={`transition-all duration-200 ${expandedItems.has(log.id) ? "shadow-sm" : "hover:shadow-sm"}`}
                    >
                      <CardBody className="p-4">
                        <button
                          className="w-full text-left"
                          onClick={() => toggleExpanded(log.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* <div className="flex-shrink-0">
                              {getStatusIcon(log.breakdown.status)}
                            </div> */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Chip
                                    className="font-medium text-xs"
                                    color={getStatusColor(log.breakdown.status)}
                                    size="sm"
                                    variant="flat"
                                  >
                                    {log.breakdown.status.toUpperCase()}
                                  </Chip>
                                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                                    #{log.breakdown.breakdownNumber}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Completed
                                </p>
                                <p className="text-xs font-medium">
                                  {formatTimeAgo(log.resolvedAt)}
                                </p>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                  expandedItems.has(log.id) ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedItems.has(log.id)
                              ? "max-h-[1000px] opacity-100 mt-3"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            {/* Timeline Section */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 p-3 rounded-lg">
                              {log.breakdown.description}dan banyak lagi ada
                              temyan dan kawan kaywan yang ada disana laho
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800/20 rounded-lg">
                                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                    Reported
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatDate(log.breakdown.breakdownTime)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <div className="p-2 bg-green-100 dark:bg-green-800/20 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                                    Resolved
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatDate(log.resolvedAt)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Components Section */}
                            {log.breakdown.components.length > 0 && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Wrench className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Affected Components
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  {log.breakdown.components.map(
                                    (component, i) => (
                                      <div
                                        key={i}
                                        className="flex gap-2 text-sm"
                                      >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                          {component.component}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {component.subcomponent}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Solution Section */}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  Solution
                                </h4>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {log.solution}
                              </p>
                            </div>

                            {/* Work Details Section */}
                            {log.workDetails && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <ClipboardList className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Work Details
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {log.workDetails}
                                </p>
                              </div>
                            )}

                            {/* Actions Section */}
                            {log.actions.length > 0 && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Actions Taken
                                  </h4>
                                </div>
                                <div className="space-y-3">
                                  {log.actions.map((action) => (
                                    <div
                                      key={action.id}
                                      className="pl-2 border-l-2 border-gray-200 dark:border-gray-700"
                                    >
                                      <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          {action.action}
                                        </p>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {formatDate(action.actionTime)}
                                        </span>
                                      </div>
                                      {action.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {action.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resolved By Section */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  className="bg-primary-600 text-primary-100 dark:bg-primary-900/60 dark:text-primary-400"
                                  name={log.resolvedBy.name}
                                  size="sm"
                                />
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Resolved By
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {log.resolvedBy.name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                className="font-medium text-sm"
                color="danger"
                variant="solid"
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
