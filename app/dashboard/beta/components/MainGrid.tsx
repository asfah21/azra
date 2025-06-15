"use client";

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
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  SettingsIcon,
  Wrench,
} from "lucide-react";

export default function MainGridAsset() {
  const recentAssetActivities = [
    {
      id: 1,
      assetName: "Compressor Unit A-101",
      action: "Scheduled maintenance completed",
      technician: "Ahmad Ridwan",
      time: "30 minutes ago",
      avatar: "https://i.pravatar.cc/150?u=1",
      type: "maintenance",
      location: "Plant A - Floor 2",
    },
    {
      id: 2,
      assetName: "Generator B-205",
      action: "Emergency repair initiated",
      technician: "Siti Nurhaliza",
      time: "1 hour ago",
      avatar: "https://i.pravatar.cc/150?u=2",
      type: "emergency",
      location: "Plant B - Basement",
    },
    {
      id: 3,
      assetName: "Conveyor Belt C-301",
      action: "Performance inspection done",
      technician: "Budi Santoso",
      time: "2 hours ago",
      avatar: "https://i.pravatar.cc/150?u=3",
      type: "inspection",
      location: "Plant C - Floor 1",
    },
    {
      id: 4,
      assetName: "Pump System D-102",
      action: "Calibration completed",
      technician: "Maya Sari",
      time: "3 hours ago",
      avatar: "https://i.pravatar.cc/150?u=4",
      type: "calibration",
      location: "Plant D - Floor 3",
    },
  ];

  const criticalAssets = [
    {
      id: 1,
      name: "Boiler System A-001",
      status: "Critical",
      lastMaintenance: "2 days ago",
      nextMaintenance: "Overdue",
      location: "Plant A",
      priority: "High",
    },
    {
      id: 2,
      name: "Cooling Tower B-003",
      status: "Warning",
      lastMaintenance: "1 week ago",
      nextMaintenance: "Tomorrow",
      location: "Plant B",
      priority: "Medium",
    },
    {
      id: 3,
      name: "Electrical Panel C-025",
      status: "Maintenance",
      lastMaintenance: "Today",
      nextMaintenance: "Next week",
      location: "Plant C",
      priority: "Low",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="w-4 h-4 text-primary" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "inspection":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "calibration":
        return <SettingsIcon className="w-4 h-4 text-secondary" />;
      default:
        return <Package className="w-4 h-4 text-default" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "primary";
      case "emergency":
        return "danger";
      case "inspection":
        return "success";
      case "calibration":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "danger";
      case "Warning":
        return "warning";
      case "Maintenance":
        return "primary";
      case "Operational":
        return "success";
      case "operational":
        return "success";
      case "maintenance":
        return "warning";
      case "standby":
        return "secondary";
      case "critical":
        return "danger";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "danger";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Recent Asset Activities */}
      <Card className="bg-gradient-to-br from-default-50 to-default-100">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-default-500 rounded-lg">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-default-800">
              Recent Activities
            </p>
            <p className="text-small text-default-600 hidden sm:block">
              Latest asset maintenance and operations
            </p>
          </div>
          <Button
            className="flex-shrink-0"
            color="primary"
            endContent={<Package className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">All</span>
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            {recentAssetActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-default-100 transition-colors"
              >
                <Avatar
                  isBordered
                  className="flex-shrink-0"
                  color={getActivityColor(activity.type) as any}
                  size="sm"
                  src={activity.avatar}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <p className="font-semibold text-default-700 truncate text-sm sm:text-base">
                      {activity.assetName}
                    </p>
                    <Chip
                      className="self-start sm:self-center"
                      color={getActivityColor(activity.type) as any}
                      size="sm"
                      variant="dot"
                    >
                      {activity.type}
                    </Chip>
                  </div>
                  <p className="text-small text-default-600 mb-1 line-clamp-2">
                    {activity.action}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-tiny text-default-500">
                    <User
                      avatarProps={{ size: "sm", className: "w-4 h-4" }}
                      classNames={{
                        name: "text-tiny text-default-500 truncate",
                      }}
                      name={activity.technician}
                    />
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{activity.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                  {getActivityIcon(activity.type)}
                  <span className="text-tiny text-default-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Critical Assets Table */}
      <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
        <CardHeader className="flex gap-3 px-4 sm:px-6">
          <div className="p-2 bg-danger-500 rounded-lg">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-danger-800">
              Critical Assets
            </p>
            <p className="text-small text-danger-600 hidden sm:block">
              Assets requiring immediate attention
            </p>
          </div>
          <Button
            className="flex-shrink-0"
            color="danger"
            endContent={<AlertTriangle className="w-4 h-4" />}
            size="sm"
            variant="flat"
          >
            <span className="hidden sm:inline">Manage</span>
            <span className="sm:hidden">Manage</span>
          </Button>
        </CardHeader>
        <Divider className="bg-danger-200" />
        <CardBody className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            {criticalAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-3 sm:p-4 bg-white dark:bg-default-50 rounded-lg border border-danger-200 hover:border-danger-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-2 gap-2">
                  <h4 className="font-semibold text-default-800 text-sm sm:text-base truncate">
                    {asset.name}
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    <Chip
                      color={getStatusColor(asset.status) as any}
                      size="sm"
                      variant="flat"
                    >
                      {asset.status}
                    </Chip>
                    <Chip
                      color={getPriorityColor(asset.priority) as any}
                      size="sm"
                      variant="dot"
                    >
                      {asset.priority}
                    </Chip>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-small">
                  <div>
                    <span className="text-default-500">Location:</span>
                    <p className="font-medium text-default-700 truncate">
                      {asset.location}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500">Last Maintenance:</span>
                    <p className="font-medium text-default-700">
                      {asset.lastMaintenance}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500">Next Maintenance:</span>
                    <p className="font-medium text-default-700">
                      {asset.nextMaintenance}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      className="flex-1 sm:flex-none"
                      color="primary"
                      size="sm"
                      startContent={<Wrench className="w-3 h-3" />}
                      variant="flat"
                    >
                      Schedule
                    </Button>
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
