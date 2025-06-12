"use client";

import {
  Badge,
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
} from "lucide-react";

interface UserStats {
  total: number;
  new: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export default function UserCardGrids({ stats }: UserStatsCardsProps) {
  return (
    <>
      {/* Total Users Card */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-primary-800">
              Total Users
            </p>
            <p className="text-small text-primary-600">All Accounts</p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary-700">
                {stats.total}
              </span>
              <Chip color="primary" size="sm" variant="flat">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1
                {/* {userStats.growthRate} */}
              </Chip>
            </div>
            <p className="text-small text-default-600">Registered users</p>
          </div>
        </CardBody>
      </Card>

      {/* Active Users Card */}
      <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-success-500 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-success-800">
              Active Users
            </p>
            <p className="text-small text-success-600">Last 30 Days</p>
          </div>
        </CardHeader>
        <Divider className="bg-success-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-success-700">
                {/* {userStats.activeUsers} */} N/A
              </span>
              <Badge
                color="success"
                content="on"
                //   content={userStats.onlineNow}
                variant="flat"
              >
                <div className="w-4 h-4 bg-success-500 rounded-full animate-pulse" />
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-small text-default-600">
                  Activity Rate
                </span>
                <span className="text-small font-medium">71.5%</span>
              </div>
              <Progress
                className="max-w-full"
                color="success"
                size="sm"
                value={71.5}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* New Users Card */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-secondary-800">
              New Users
            </p>
            <p className="text-small text-secondary-600">Today</p>
          </div>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-secondary-700">
                {/* {userStats.newUsersToday} */} NewUserToday
              </span>
              <Chip
                color="secondary"
                size="sm"
                startContent={<Calendar className="w-3 h-3" />}
                variant="flat"
              >
                24h
              </Chip>
            </div>
            <p className="text-small text-default-600">New registrations</p>
          </div>
        </CardBody>
      </Card>

      {/* Inactive Users Card */}
      <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-warning-500 rounded-lg">
            <UserX className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-warning-800">
              Inactive Users
            </p>
            <p className="text-small text-warning-600">30+ Days</p>
          </div>
        </CardHeader>
        <Divider className="bg-warning-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-warning-700">
                {/* {userStats.inactiveUsers} */} InactiveUser
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
            <p className="text-small text-default-600">Need re-engagement</p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
