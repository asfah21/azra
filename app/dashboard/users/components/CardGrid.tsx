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
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  UsersRoundIcon,
} from "lucide-react";

interface UserStats {
  total: number;
  new: number;
  active: number;
  inactive: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export default function UserCardGrids({ stats }: UserStatsCardsProps) {
  return (
    <>
      {/* Total Users Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-primary-800 truncate">
              Total Users
            </p>
            <p className="text-xs sm:text-small text-primary-600">
              All Accounts
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
                +1
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Registered users
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Active Users Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
            <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">
              Active Users
            </p>
            <p className="text-xs sm:text-small text-success-600">
              Last 30 Days
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
                  Activity Rate
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

      {/* New Users Card */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
            <UserPlus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-secondary-800 truncate">
              New Users
            </p>
            <p className="text-xs sm:text-small text-secondary-600">
              This Month
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-secondary-700">
                {stats.new}
              </span>
              <Chip
                color="secondary"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                30d
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              New registrations
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Inactive Users Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
            <UserX className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">
              Inactive Users
            </p>
            <p className="text-xs sm:text-small text-warning-600">30 Days</p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">
                {stats.inactive}
              </span>
              <Chip
                color="warning"
                size="sm"
                startContent={<Clock className="w-3 h-3" />}
                variant="flat"
              >
                Stale
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Need re-engagement
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
