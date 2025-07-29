"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Package,
  Users,
  Wrench,
} from "lucide-react";
import * as XLSX from "xlsx";

import { TableReportSkeletons } from "@/components/ui/skeleton";

interface TableReportProps {
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    time: string;
    avatar: string;
    type: string;
    createdAt: Date;
  }>;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function TableReport({
  recentActivities,
  loading,
  error,
  onRetry,
}: TableReportProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Package className="w-3 h-3" />;
      case "work_order":
        return <Wrench className="w-3 h-3" />;
      case "maintenance":
        return <CheckCircle2 className="w-3 h-3" />;
      case "alert":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "asset":
        return "primary";
      case "work_order":
        return "warning";
      case "maintenance":
        return "success";
      case "alert":
        return "danger";
      default:
        return "default";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "asset":
        return "Asset";
      case "work_order":
        return "Work Order";
      case "maintenance":
        return "Maintenance";
      case "alert":
        return "Alert";
      default:
        return "Activity";
    }
  };

  const ErrorState = () => (
    <div className="text-center py-8">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-danger-500" />
      <p className="text-danger-600 mb-4">Gagal memuat aktivitas terbaru</p>
      <Button color="danger" size="sm" variant="flat" onPress={onRetry}>
        Coba Lagi
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-default-500">
      <Activity className="w-8 h-8 mx-auto mb-2 text-default-400" />
      <p>Tidak ada aktivitas terbaru</p>
    </div>
  );

  const handleDownloadXLS = () => {
    // Prepare data for export
    const data = recentActivities.map((activity, index) => ({
      No: index + 1,
      User: activity.user,
      Action: activity.action,
      Type: getActivityLabel(activity.type),
      Time: activity.time,
      Date: new Date(activity.createdAt).toLocaleDateString(),
    }));

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Log Activity");

    // Generate the XLS file
    XLSX.writeFile(
      wb,
      `activity_log_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Tampilkan skeleton loading terlebih dahulu
  if (loading) {
    return (
      <div className="mb-4">
        <TableReportSkeletons />
      </div>
    );
  }

  // Setelah loading selesai, tampilkan isi card
  return (
    <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100">
      <CardHeader className="flex gap-3">
        <div className="p-2 bg-secondary-500 rounded-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col flex-1">
          <p className="text-xl font-semibold text-secondary-800">
            Log Activity
          </p>
          <p className="text-xs hidden sm:block text-secondary-600">
            Log activity system and user
          </p>
        </div>
        <Button
          color="secondary"
          isDisabled={recentActivities.length === 0}
          size="sm"
          startContent={<Download className="w-4 h-4" />}
          variant="flat"
          onPress={handleDownloadXLS}
        >
          <p className="text-md font-bold">XLS</p>
        </Button>
      </CardHeader>

      <Divider className="bg-secondary-200" />
      <CardBody className="px-4 py-2">
        {error ? (
          <ErrorState />
        ) : recentActivities.length > 0 ? (
          <div className="space-y-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-4 p-2 rounded-xl hover:bg-secondary-100 transition-colors"
              >
                {/* Kiri: User Info */}
                <div className="flex items-center gap-3 min-w-[512px] flex-1">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${activity.user === "System" ? "bg-secondary-200" : "bg-primary-200"}`}
                  >
                    {activity.user === "System" ? (
                      <Activity className="w-5 h-5 text-secondary-600" />
                    ) : (
                      <Users className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-default-700 truncate">
                      {activity.user}
                    </span>
                    <span className="text-xs text-default-500 truncate">
                      {activity.action}
                    </span>
                  </div>
                </div>

                {/* Kanan: Info Tags */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="hidden sm:block">
                    {getActivityIcon(activity.type)}
                  </div>
                  <Chip
                    color={getActivityColor(activity.type) as any}
                    size="sm"
                    variant="flat"
                  >
                    {getActivityLabel(activity.type)}
                  </Chip>
                  <Chip
                    color="default"
                    size="sm"
                    startContent={<Clock className="w-3 h-3" />}
                    variant="flat"
                  >
                    {activity.time}
                  </Chip>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardBody>
    </Card>
  );
}
