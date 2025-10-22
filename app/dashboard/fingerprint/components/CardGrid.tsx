"use client";

import { Card, CardBody, CardHeader, Chip, Divider } from "@heroui/react";
import {
  Calendar,
  CalendarMinus,
  CalendarPlus,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
} from "lucide-react";

interface UserStats {
  type0Today: number;
  type1Today: number;
  type0ThisMonth: number;
  type1ThisMonth: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export default function FingerCardGrids({ stats }: UserStatsCardsProps) {
  return (
    <>
      {/* Total Users Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
            <UserPlus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">
              In Today
            </p>
            <p className="text-xs sm:text-small text-success-600">
              Checked in employees
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-success-700">
                {stats.type0Today}
              </span>
              <Chip
                color="success"
                size="sm"
                startContent={<TrendingUp className="w-3 h-3" />}
                variant="flat"
              >
                1d
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Present employees
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Active Users Card */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-danger-500 rounded-lg">
            <UserMinus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-danger-800 truncate">
              Out Today
            </p>
            <p className="text-xs sm:text-small text-danger-600">
              Checked out employees
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-danger-700">
                {stats.type1Today}
              </span>
              <Chip
                color="danger"
                size="sm"
                startContent={<TrendingDown className="w-3 h-3" />}
                variant="flat"
              >
                1d
              </Chip>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-small text-default-600">
                  Total check-outs
                </span>
                {/* <span className="text-xs sm:text-small font-medium">
                  {stats.total > 0
                    ? Math.round((stats.active / stats.total) * 100)
                    : 0}
                  %
                </span> */}
              </div>
              {/* <Progress
                aria-label="Loading..."
                className="max-w-full"
                color="success"
                size="sm"
                value={stats.total > 0 ? (stats.active / stats.total) * 100 : 0}
              /> */}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* New Users Card */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-secondary-500 rounded-lg">
            <CalendarPlus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-secondary-800 truncate">
              In This Month
            </p>
            <p className="text-xs sm:text-small text-secondary-600">
              Monthly check-ins
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-secondary-700">
                {stats.type0ThisMonth}
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
              Recorded check-ins
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Inactive Users Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-2 sm:gap-3 pb-2">
          <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
            <CalendarMinus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">
              Out This Month
            </p>
            <p className="text-xs sm:text-small text-warning-600">
              Monthly check-outs
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl sm:text-2xl font-bold text-warning-700">
                {stats.type1ThisMonth}
              </span>
              <Chip
                color="warning"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                30d
              </Chip>
            </div>
            <p className="text-xs sm:text-small text-default-600">
              Recorded check-outs
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
