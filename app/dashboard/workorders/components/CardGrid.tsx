"use client";

import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  UserIcon,
} from "lucide-react";

export default function WoCardGrid() {
  // Mock data untuk work orders
  const workOrderStats = {
    totalOrders: 847,
    pendingOrders: 156,
    inProgressOrders: 98,
    completedToday: 34,
    overdueOrders: 23,
    completionRate: 89.2,
    avgCompletionTime: 4.2,
  };

  return (
    <>
      {/* Total Orders Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
            <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-primary-800 truncate">
              Total Orders
            </p>
            <p className="text-xs sm:text-small text-primary-600">
              All Work Orders
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-primary-700">
                {workOrderStats.totalOrders}
              </span>
              <Chip color="primary" size="sm" variant="flat">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Total requests
            </p>
          </div>
        </CardBody>
      </Card>

      {/* In Progress Orders Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
            <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">
              In Progress
            </p>
            <p className="text-xs sm:text-small text-success-600">
              Active Tasks
            </p>
          </div>
        </CardHeader>
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-success-700">
                {workOrderStats.inProgressOrders}
              </span>
              <Badge
                color="success"
                content={workOrderStats.completedToday}
                variant="flat"
              >
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-success-500 rounded-full animate-pulse" />
              </Badge>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-small text-default-600">
                  Progress
                </span>
                <span className="text-xs sm:text-small font-medium">
                  {workOrderStats.completionRate}%
                </span>
              </div>
              <Progress
                className="max-w-full"
                color="success"
                size="sm"
                value={workOrderStats.completionRate}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pending Orders Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">
              Pending
            </p>
            <p className="text-xs sm:text-small text-warning-600">Awaiting</p>
          </div>
        </CardHeader>
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">
                {workOrderStats.pendingOrders}
              </span>
              <Chip
                color="warning"
                size="sm"
                startContent={<UserIcon className="w-3 h-3" />}
                variant="flat"
              >
                Queue
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Need assignment
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Overdue Orders Card */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-danger-500 rounded-lg">
            <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-danger-800 truncate">
              Overdue
            </p>
            <p className="text-xs sm:text-small text-danger-600">Past Due</p>
          </div>
        </CardHeader>
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-danger-700">
                {workOrderStats.overdueOrders}
              </span>
              <Chip
                color="danger"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                Late
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Need attention
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
