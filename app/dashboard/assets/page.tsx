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
  Package,
  Wrench,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Settings as SettingsIcon,
  Zap,
  Calendar,
  MapPin,
  Filter,
  Search,
  Plus,
} from "lucide-react";

export default function AssetsPage() {
  // Mock data untuk assets
  const assetsStats = {
    totalAssets: 847,
    activeAssets: 723,
    maintenanceAssets: 89,
    criticalAssets: 35,
    availabilityRate: 92.3,
  };

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Asset Management
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            color="default"
            size="sm"
            startContent={<Filter className="w-4 h-4" />}
            variant="flat"
          >
            Filter
          </Button>
          <Button
            color="default"
            size="sm"
            startContent={<Search className="w-4 h-4" />}
            variant="flat"
          >
            Search
          </Button>
          <Button
            color="primary"
            size="sm"
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Assets Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-primary-800">
                Total Assets
              </p>
              <p className="text-small text-primary-600">All Equipment</p>
            </div>
          </CardHeader>
          <Divider className="bg-primary-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary-700">
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
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-success-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-success-800">
                Active Assets
              </p>
              <p className="text-small text-success-600">Operational</p>
            </div>
          </CardHeader>
          <Divider className="bg-success-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-success-700">
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
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-warning-800">
                In Maintenance
              </p>
              <p className="text-small text-warning-600">Under Service</p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-warning-700">
                  {assetsStats.maintenanceAssets}
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
              <p className="text-small text-default-600">
                Active maintenance tasks
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Critical Assets Card */}
        <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-danger-500 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-danger-800">
                Critical Assets
              </p>
              <p className="text-small text-danger-600">Need Attention</p>
            </div>
          </CardHeader>
          <Divider className="bg-danger-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-danger-700">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Asset Activities */}
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
                Latest asset maintenance and operations
              </p>
            </div>
            <Button
              color="primary"
              endContent={<Package className="w-4 h-4" />}
              size="sm"
              variant="flat"
            >
              View All
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              {recentAssetActivities.map((activity) => (
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
                      <p className="font-semibold text-default-700 truncate">
                        {activity.assetName}
                      </p>
                      <Chip
                        color={getActivityColor(activity.type) as any}
                        size="sm"
                        variant="dot"
                      >
                        {activity.type}
                      </Chip>
                    </div>
                    <p className="text-small text-default-600 mb-1">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 text-tiny text-default-500">
                      <User
                        classNames={{
                          name: "text-tiny text-default-500",
                        }}
                        name={activity.technician}
                      />
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                    <span className="text-tiny text-default-500">
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
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-danger-500 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-xl font-semibold text-danger-800">
                Critical Assets
              </p>
              <p className="text-small text-danger-600">
                Assets requiring immediate attention
              </p>
            </div>
            <Button
              color="danger"
              endContent={<AlertTriangle className="w-4 h-4" />}
              size="sm"
              variant="flat"
            >
              Manage
            </Button>
          </CardHeader>
          <Divider className="bg-danger-200" />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              {criticalAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 bg-white rounded-lg border border-danger-200 hover:border-danger-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-default-800">
                      {asset.name}
                    </h4>
                    <div className="flex gap-2">
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
                  <div className="grid grid-cols-2 gap-4 text-small">
                    <div>
                      <span className="text-default-500">Location:</span>
                      <p className="font-medium text-default-700">
                        {asset.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-default-500">
                        Last Maintenance:
                      </span>
                      <p className="font-medium text-default-700">
                        {asset.lastMaintenance}
                      </p>
                    </div>
                    <div>
                      <span className="text-default-500">
                        Next Maintenance:
                      </span>
                      <p className="font-medium text-default-700">
                        {asset.nextMaintenance}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
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
      </div>
    </div>
  );
}
