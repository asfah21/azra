"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Activity,
  Clock,
  Edit,
  Eye,
  MapPin,
  Plus,
  Shield,
  TrendingUp,
  UserCheck,
} from "lucide-react";

export default function UserMainGrid() {
  const recentUserActivities = [
    {
      id: 1,
      user: "Ahmad Ridwan",
      action: "Logged in to system",
      time: "5 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=1",
      type: "login",
      location: "Jakarta, Indonesia",
      device: "Desktop",
    },
    {
      id: 2,
      user: "Siti Nurhaliza",
      action: "Updated profile information",
      time: "15 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=2",
      type: "profile",
      location: "Bandung, Indonesia",
      device: "Mobile",
    },
    {
      id: 3,
      user: "Budi Santoso",
      action: "Created new work order",
      time: "30 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=3",
      type: "create",
      location: "Surabaya, Indonesia",
      device: "Tablet",
    },
    {
      id: 4,
      user: "Maya Sari",
      action: "Downloaded monthly report",
      time: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?u=4",
      type: "download",
      location: "Medan, Indonesia",
      device: "Desktop",
    },
    {
      id: 5,
      user: "Indra Kusuma",
      action: "Password changed successfully",
      time: "2 hours ago",
      avatar: "https://i.pravatar.cc/150?u=5",
      type: "security",
      location: "Yogyakarta, Indonesia",
      device: "Mobile",
    },
  ];

  const topUsers = [
    {
      id: 1,
      name: "Ahmad Ridwan",
      email: "ahmad.ridwan@company.com",
      role: "Admin",
      department: "IT Operations",
      avatar: "https://i.pravatar.cc/150?u=1",
      status: "online",
      lastActive: "Active now",
      tasksCompleted: 145,
      joinDate: "Jan 2023",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti.nurhaliza@company.com",
      role: "Technician",
      department: "Maintenance",
      avatar: "https://i.pravatar.cc/150?u=2",
      status: "online",
      lastActive: "2 minutes ago",
      tasksCompleted: 132,
      joinDate: "Mar 2023",
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi.santoso@company.com",
      role: "Supervisor",
      department: "Production",
      avatar: "https://i.pravatar.cc/150?u=3",
      status: "away",
      lastActive: "15 minutes ago",
      tasksCompleted: 98,
      joinDate: "Jun 2022",
    },
    {
      id: 4,
      name: "Maya Sari",
      email: "maya.sari@company.com",
      role: "Manager",
      department: "Quality Control",
      avatar: "https://i.pravatar.cc/150?u=4",
      status: "offline",
      lastActive: "3 hours ago",
      tasksCompleted: 87,
      joinDate: "Sep 2022",
    },
    {
      id: 5,
      name: "Indra Kusuma",
      email: "indra.kusuma@company.com",
      role: "Operator",
      department: "Manufacturing",
      avatar: "https://i.pravatar.cc/150?u=5",
      status: "online",
      lastActive: "Just now",
      tasksCompleted: 76,
      joinDate: "Nov 2023",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return <UserCheck className="w-4 h-4 text-success" />;
      case "profile":
        return <Edit className="w-4 h-4 text-primary" />;
      case "create":
        return <Plus className="w-4 h-4 text-secondary" />;
      case "download":
        return <Activity className="w-4 h-4 text-warning" />;
      case "security":
        return <Shield className="w-4 h-4 text-danger" />;
      default:
        return <Activity className="w-4 h-4 text-default" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return "success";
      case "profile":
        return "primary";
      case "create":
        return "secondary";
      case "download":
        return "warning";
      case "security":
        return "danger";
      default:
        return "default";
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop":
        return "💻";
      case "Mobile":
        return "📱";
      case "Tablet":
        return "📲";
      default:
        return "💻";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Manager":
        return "warning";
      case "Supervisor":
        return "secondary";
      case "Technician":
        return "primary";
      case "Operator":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Recent User Activities */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-default-50 to-default-100">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-default-800">
              Recent Activities
            </p>
            <p className="text-small text-default-600">
              Latest user actions and system interactions
            </p>
          </div>
          <Button
            color="primary"
            endContent={<Eye className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            View All
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-4">
          <div className="space-y-4">
            {recentUserActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-default-100 transition-colors"
              >
                <Avatar
                  isBordered
                  color={getActivityColor(activity.type) as any}
                  size="md"
                  src={activity.avatar}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-default-700">
                      {activity.user}
                    </p>
                    <Chip
                      color={getActivityColor(activity.type) as any}
                      size="sm"
                      variant="dot"
                    >
                      {activity.type}
                    </Chip>
                  </div>
                  <p className="text-small text-default-600 mb-2">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-4 text-tiny text-default-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{getDeviceIcon(activity.device)}</span>
                      {activity.device}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Top Users */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-xl font-semibold text-primary-800">Top Users</p>
            <p className="text-small text-primary-600">
              Most active users this month
            </p>
          </div>
        </CardHeader>
        <Divider className="bg-primary-200" />
        <CardBody className="px-6 py-4">
          <div className="space-y-4">
            {topUsers.slice(0, 5).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar size="sm" src={user.avatar} />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === "online"
                          ? "bg-success-500"
                          : user.status === "away"
                            ? "bg-warning-500"
                            : "bg-default-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-default-700 truncate">
                      {user.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Chip
                        color={getRoleColor(user.role) as any}
                        size="sm"
                        variant="flat"
                      >
                        {user.role}
                      </Chip>
                      <span className="text-tiny text-default-500">
                        {user.tasksCompleted} tasks
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-small font-bold text-primary-600">
                    #{index + 1}
                  </div>
                  <div className="text-tiny text-default-500">
                    {user.lastActive}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
