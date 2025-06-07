"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Avatar,
  Button,
  Progress,
  Badge,
  User,
} from "@heroui/react";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Assets() {
  // Mock data untuk demo
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    growthRate: 12.5,
  };

  const recentActivities = [
    {
      id: 1,
      user: "Ahmad Ridwan",
      action: "Created new work order",
      time: "2 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=1",
      type: "create",
    },
    {
      id: 2,
      user: "Siti Nurhaliza",
      action: "Completed maintenance task",
      time: "15 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=2",
      type: "complete",
    },
    {
      id: 3,
      user: "Budi Santoso",
      action: "Updated asset status",
      time: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?u=3",
      type: "update",
    },
    {
      id: 4,
      user: "Maya Sari",
      action: "Generated monthly report",
      time: "2 hours ago",
      avatar: "https://i.pravatar.cc/150?u=4",
      type: "report",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "create":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "update":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "report":
        return <BarChart3 className="w-4 h-4 text-secondary" />;
      default:
        return <Activity className="w-4 h-4 text-default" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "create":
        return "success";
      case "complete":
        return "primary";
      case "update":
        return "warning";
      case "report":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Dashboard Profile
          </h1>
          <p className="text-default-500 mt-1">
            Monitor system performance and user activities
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Statistik Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-primary-800">
                Statistik Sistem
              </p>
              <p className="text-small text-primary-600">
                Performance Overview
              </p>
            </div>
          </CardHeader>
          <Divider className="bg-primary-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Total Work Orders</span>
                <Chip color="primary" size="sm" variant="flat">
                  342
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Completed Today</span>
                <Chip color="success" size="sm" variant="flat">
                  28
                </Chip>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-small text-default-600">
                    Completion Rate
                  </span>
                  <span className="text-small font-medium">87%</span>
                </div>
                <Progress
                  className="max-w-full"
                  color="primary"
                  size="sm"
                  value={87}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pengguna Card */}
        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-success-800">
                Pengguna Aktif
              </p>
              <p className="text-small text-success-600">User Management</p>
            </div>
          </CardHeader>
          <Divider className="bg-success-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Total Users</span>
                <span className="text-xl font-bold text-success-700">
                  {stats.totalUsers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Active Now</span>
                <Badge
                  color="success"
                  content={stats.activeUsers}
                  variant="flat"
                >
                  <div className="w-4 h-4 bg-success-500 rounded-full animate-pulse" />
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">New Today</span>
                <Chip
                  color="success"
                  size="sm"
                  startContent={<TrendingUp className="w-3 h-3" />}
                  variant="flat"
                >
                  +{stats.newUsersToday}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Log Aktivitas Card */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-warning-800">
                Log Aktivitas
              </p>
              <p className="text-small text-warning-600">Recent Activities</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-3">
              {recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <Avatar
                    className="flex-shrink-0"
                    size="sm"
                    src={activity.avatar}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium text-default-700 truncate">
                      {activity.user}
                    </p>
                    <p className="text-tiny text-default-500 truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getActivityIcon(activity.type)}
                    <Chip
                      color={getActivityColor(activity.type) as any}
                      size="sm"
                      variant="dot"
                    >
                      {activity.time.split(" ")[0]}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activities Detail */}
      <Card className="bg-gradient-to-br from-default-50 to-default-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-default-800">
              Recent Activities
            </p>
            <p className="text-small text-default-600">
              Latest system activities and user actions
            </p>
          </div>
          <Button
            color="primary"
            endContent={<Activity className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            View All
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-4">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-default-100 transition-colors"
              >
                <Avatar
                  isBordered
                  color={getActivityColor(activity.type) as any}
                  size="md"
                  src={activity.avatar}
                />
                <div className="flex-1">
                  <User
                    classNames={{
                      name: "font-semibold text-default-700",
                      description: "text-default-500",
                    }}
                    description={activity.action}
                    name={activity.user}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <Chip
                    color={getActivityColor(activity.type) as any}
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
        </CardBody>
      </Card>
    </div>
  );
}
