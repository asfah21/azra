"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Progress,
  Badge,
} from "@heroui/react";
import {
  Package,
  Wrench,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  Calendar,
} from "lucide-react";

export default function AssetCardGrid() {
  const assetsStats = {
    totalAssets: 847,
    activeAssets: 723,
    maintenanceAssets: 89,
    criticalAssets: 35,
    availabilityRate: 92.3,
  };

  return (
    <>
      {/* Total Assets Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-primary-500 rounded-lg">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-primary-800 truncate">
              Total Assets
            </p>
            <p className="text-small text-primary-600">All Equipment</p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-primary-700">
                {assetsStats.totalAssets}
              </span>
              <Chip color="primary" size="sm" variant="flat">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.2%
              </Chip>
            </div>
            <p className="text-small text-default-600">Equipment inventory</p>
          </div>
        </CardBody>
      </Card>

      {/* Active Assets Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-success-500 rounded-lg">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-success-800 truncate">
              Active Assets
            </p>
            <p className="text-small text-success-600">Operational</p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-success-700">
                {assetsStats.activeAssets}
              </span>
              <Badge color="success" content="Live" variant="flat">
                <div className="w-4 h-4 bg-success-500 rounded-full animate-pulse" />
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-small text-default-600">
                  Availability
                </span>
                <span className="text-small font-medium">
                  {assetsStats.availabilityRate}%
                </span>
              </div>
              <Progress
                aria-label="Loading..."
                className="max-w-full"
                color="success"
                size="sm"
                value={assetsStats.availabilityRate}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Maintenance Assets Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-warning-500 rounded-lg">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-warning-800 truncate">
              In Maintenance
            </p>
            <p className="text-small text-warning-600">Under Service</p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">
                {assetsStats.maintenanceAssets}
              </span>
              <Chip
                color="warning"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                <span className="hidden sm:inline">Scheduled</span>
                <span className="sm:hidden">Sched</span>
              </Chip>
            </div>
            <p className="text-small text-default-600">
              Active maintenance tasks
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Critical Assets Card */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-danger-500 rounded-lg">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-base sm:text-lg font-semibold text-danger-800 truncate">
              Critical Assets
            </p>
            <p className="text-small text-danger-600">Need Attention</p>
          </div>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-danger-700">
                {assetsStats.criticalAssets}
              </span>
              <Chip
                color="danger"
                size="sm"
                startContent={<AlertTriangle className="w-3 h-3" />}
                variant="flat"
              >
                Urgent
              </Chip>
            </div>
            <p className="text-small text-default-600">
              Requires immediate action
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
