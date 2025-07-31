"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Package,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  startTransition,
} from "react";

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
  currentPage?: number;
  totalPages?: number;
  totalActivities?: number;
  onPageChange?: (page: number) => void;
}

const ROWS_PER_PAGE = 10;

export default function TableReport({
  recentActivities,
  loading,
  error,
  onRetry,
  currentPage = 0,
  totalPages = 0,
  totalActivities = 0,
  onPageChange,
}: TableReportProps) {
  // State management for search
  const [searchQuery, setSearchQuery] = useState("");

  // Use deferred value untuk mengurangi re-render saat typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Optimized search dengan useCallback
  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
  }, []);

  // Callback untuk pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange && onPageChange(newPage);
    },
    [onPageChange],
  );

  // Filter data berdasarkan deferred search query (client-side search)
  const filteredData = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return recentActivities;
    }

    const query = deferredSearchQuery.toLowerCase();

    return recentActivities.filter((activity) => {
      return (
        (activity.user && activity.user.toLowerCase().includes(query)) ||
        (activity.action && activity.action.toLowerCase().includes(query)) ||
        (activity.type && activity.type.toLowerCase().includes(query)) ||
        (activity.time && activity.time.toLowerCase().includes(query))
      );
    });
  }, [recentActivities, deferredSearchQuery]);
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Package className="w-3 h-3" />;
      case "workorder":
        return <Wrench className="w-3 h-3" />;
      case "maintenance":
        return <CheckCircle2 className="w-3 h-3" />;
      case "breakdown":
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "asset":
        return "primary";
      case "workorder":
        return "warning";
      case "maintenance":
        return "success";
      case "breakdown":
        return "danger";
      default:
        return "default";
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "asset":
        return "Asset";
      case "workorder":
        return "Work Order";
      case "maintenance":
        return "Maintenance";
      case "breakdown":
        return "Breakdown";
      default:
        return "Activity";
    }
  };

  const ErrorState = () => (
    <div className="text-center py-8">
      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-danger-500" />
      <p className="text-danger-600 mb-4">Failed to load recent activities</p>
      <Button color="danger" size="sm" variant="flat" onPress={onRetry}>
        Try Again
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-default-500">
      <Activity className="w-8 h-8 mx-auto mb-2 text-default-400" />
      <p>No recent activities found</p>
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

  // Setelah loading selesai, tampilkan isi table
  return (
    <Card className="bg-content1 dark:bg-content1 border border-divider rounded-large shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row">
        <div className="flex items-center gap-3 flex-1 justify-start self-start">
          <div className="p-2 bg-primary rounded-lg">
            <Clock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-foreground text-left">
                Log Activity
              </p>
              <Chip
                className="text-sm font-bold"
                color="success"
                radius="sm"
                size="sm"
                variant="flat"
              >
                {filteredData.length}
              </Chip>
            </div>
            <p className="text-xs sm:block text-foreground-500">
              Log activity system and user
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            className="hidden sm:flex w-64"
            placeholder="Search activities..."
            size="sm"
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchQuery}
            variant="flat"
            onValueChange={handleSearchChange}
          />
          <Button
            color="success"
            isDisabled={recentActivities.length === 0}
            size="sm"
            startContent={<Download className="w-4 h-4" />}
            variant="flat"
            onPress={handleDownloadXLS}
          >
            <p className="text-md font-bold">XLS</p>
          </Button>
        </div>
      </CardHeader>

      <Divider className="bg-divider" />
      <CardBody className="px-0">
        {/* Search input untuk mobile */}
        <div className="px-6 pb-4 sm:hidden">
          <Input
            placeholder="Search activities..."
            size="sm"
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchQuery}
            variant="flat"
            onValueChange={handleSearchChange}
          />
        </div>

        {error ? (
          <ErrorState />
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-12 h-12 text-foreground-400 mb-4" />
            <p className="text-foreground-500">
              {deferredSearchQuery
                ? "No activities found matching your search"
                : "No activities available"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              aria-label="Activity log table"
              bottomContent={
                totalPages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={currentPage + 1} // Convert to 1-indexed for UI
                      total={totalPages}
                      onChange={(newPage) => handlePageChange(newPage - 1)} // Convert back to 0-indexed
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn className="text-foreground">USER</TableColumn>
                <TableColumn className="text-foreground">ACTION</TableColumn>
                {/* <TableColumn className="text-foreground">TYPE</TableColumn> */}
                <TableColumn className="text-foreground">TIME</TableColumn>
              </TableHeader>
              <TableBody items={filteredData}>
                {(activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {/* <User
                        avatarProps={{
                          size: "sm",
                          src: activity.avatar || undefined,
                          className:
                            "w-8 h-8 rounded-full object-cover flex-shrink-0",
                        }}
                        classNames={{
                          name: "text-sm font-medium text-foreground",
                          description: "text-xs text-foreground-500",
                          wrapper: "truncate",
                        }}
                        description={
                          activity.user === "System" ? "System" : "User"
                        }
                        name={activity.user}
                      /> */}
                      <div className="flex items-center gap-3 min-w-[256px] flex-1">
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
                          {/* <span className="text-xs text-default-500 truncate">
                            {activity.action}
                          </span> */}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      <p className="truncate max-w-full">{activity.action}</p>
                    </TableCell>
                    {/* <TableCell>
                      <Chip
                        className="capitalize"
                        color={getActivityColor(activity.type)}
                        variant="flat"
                      >
                        {activity.type}
                      </Chip>
                    </TableCell> */}
                    <TableCell className="text-sm text-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="truncate max-w-full">
                          {activity.time}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
