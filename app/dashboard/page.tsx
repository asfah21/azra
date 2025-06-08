"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Avatar,
  Button,
  User,
} from "@heroui/react";
import {
  LayoutDashboardIcon,
  BarChart3,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Shield,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  const handleTestApi = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log("API Response:", data);
      }

      alert("API call successful");
    } catch (error) {
      console.error("API Error:", error);
      alert("API Error occurred");
    }
  };

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
      user: user.name || "Current User",
      action: "Logged into dashboard",
      time: "Just now",
      avatar: "https://i.pravatar.cc/150?u=1",
      type: "login",
    },
    {
      id: 2,
      user: "System",
      action: "API call initiated",
      time: "2 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=2",
      type: "complete",
    },
    {
      id: 3,
      user: user.name || "Current User",
      action: "Profile accessed",
      time: "5 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=3",
      type: "update",
    },
    {
      id: 4,
      user: "System",
      action: "Session initialized",
      time: "10 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=4",
      type: "report",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <UserIcon className="w-4 h-4 text-success" />;
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
      case "login":
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
          <LayoutDashboardIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
      </div>

      {/* User Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* User Name Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-primary-800">
                User Name
              </p>
              <p className="text-small text-primary-600">
                Personal Information
              </p>
            </div>
          </CardHeader>
          <Divider className="bg-primary-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Name</span>
                <Chip color="primary" size="sm" variant="flat">
                  {user.name}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Status</span>
                <Chip color="success" size="sm" variant="flat">
                  Active
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* User Role Card */}
        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-success-800">
                User Role
              </p>
              <p className="text-small text-success-600">Access Level</p>
            </div>
          </CardHeader>
          <Divider className="bg-success-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Role</span>
                <span className="text-lg font-bold text-success-700 capitalize">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-sm text-default-700">ID : {user.id}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Email Card */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-warning-800">
                Email Address
              </p>
              <p className="text-small text-warning-600">Account Information</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-default-700">Email</span>
                <Chip color="warning" size="sm" variant="flat">
                  {user.email}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-700">Status</span>
                <Chip color="success" size="sm" variant="flat">
                  Active
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Dashboard Overview */}
      <Card className="bg-gradient-to-br from-default-50 to-default-100 mb-6">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-default-800">
              Dashboard Overview
            </p>
            <p className="text-small text-default-600">
              This is your protected dashboard area. You can add your
              application content here.
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-default-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-default-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-default-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-900">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-default-600 capitalize">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Chip color="success" size="sm" variant="flat">
                      Active
                    </Chip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activities Detail */}
      <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-secondary-500 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-secondary-800">
              Recent Activities
            </p>
            <p className="text-small text-secondary-600">
              Latest user activities and system actions
            </p>
          </div>
          <Button
            color="secondary"
            endContent={<Activity className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            View All
          </Button>
        </CardHeader>
        <Divider className="bg-secondary-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-100 transition-colors"
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
