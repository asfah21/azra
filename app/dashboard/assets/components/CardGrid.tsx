"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
} from "@heroui/react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Package,
  TrendingUp,
  UsersRoundIcon,
  Wrench,
  Zap,
} from "lucide-react";

interface AssetStats {
  total: number;
  new: number;
  active: number;
  maintenance: number;
  critical: number;
}

interface AssetStatsCardsProps {
  stats: AssetStats;
}

export default function AssetCardGrids({ stats }: AssetStatsCardsProps) {
  return (
    <>
      {/* Total Assets Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
            <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-primary-800 truncate">
              Total Assets
            </p>
            <p className="text-xs sm:text-small text-primary-600">
              All Equipment
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-primary-700">
                {stats.total}
              </span>
              <Chip
                color="primary"
                size="sm"
                startContent={<TrendingUp className="w-3 h-3" />}
                variant="flat"
              >
                +{stats.new}
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Equipment Inventory
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Active Assets Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">
              Active Assets
            </p>
            <p className="text-xs sm:text-small text-success-600">
              Operational
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-success-700">
                {stats.active}
              </span>
              <Chip
                color="success"
                size="sm"
                startContent={<UsersRoundIcon className="w-3 h-3" />}
                variant="flat"
              >
                On
              </Chip>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-small text-default-600">
                  Availability
                </span>
                <span className="text-xs sm:text-small font-medium">
                  {stats.total > 0
                    ? Math.round((stats.active / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                className="max-w-full"
                color="success"
                size="sm"
                value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Maintenance Assets Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
            <Wrench className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">
              In Maintenance
            </p>
            <p className="text-xs sm:text-small text-warning-600">
              Under Service
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">
                {stats.maintenance}
              </span>
              <Chip
                color="warning"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                Scheduled
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Active maintenance tasks
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Critical Assets Card */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-danger-500 rounded-lg">
            <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-danger-800 truncate">
              Critical Assets
            </p>
            <p className="text-xs sm:text-small text-danger-600">
              Need Attention
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-danger-700">
                {stats.critical}
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
            <p className="text-xs sm:text-small text-default-600">
              Requires immediate action
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
