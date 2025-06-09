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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Package,
  Wrench,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Settings as SettingsIcon,
  Zap,
  Calendar,
  MapPin,
  Filter,
  Search,
  Plus,
  Activity,
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

  const assetInventory = [
    {
      id: "AST-2024-001",
      name: "HVAC System Building A",
      description:
        "Central air conditioning and ventilation system for main building",
      category: "HVAC",
      status: "operational",
      assignedTo: "Ahmad Ridwan",
      assignedAvatar: "https://i.pravatar.cc/150?u=1",
      location: "Building A - Rooftop",
      department: "Facilities",
      manufacturer: "Daikin Industries",
      installDate: "Jan 15, 2022",
      warrantyExpiry: "Jan 15, 2027",
      lastMaintenance: "Dec 10, 2024",
      nextMaintenance: "Jan 10, 2025",
      assetValue: "$45,000",
      serialNumber: "HVAC-001-2022",
      condition: "excellent",
      utilizationRate: 85,
    },
    {
      id: "AST-2024-002",
      name: "Main Electrical Panel",
      description:
        "Primary electrical distribution panel for facility power management",
      category: "electrical",
      status: "operational",
      assignedTo: "Siti Nurhaliza",
      assignedAvatar: "https://i.pravatar.cc/150?u=2",
      location: "Main Building - Electrical Room",
      department: "Electrical",
      manufacturer: "Schneider Electric",
      installDate: "Mar 20, 2021",
      warrantyExpiry: "Mar 20, 2026",
      lastMaintenance: "Dec 05, 2024",
      nextMaintenance: "Dec 20, 2024",
      assetValue: "$25,000",
      serialNumber: "EL-PANEL-01-2021",
      condition: "good",
      utilizationRate: 92,
    },
    {
      id: "AST-2024-003",
      name: "Water Circulation Pump",
      description:
        "High-capacity centrifugal pump for building water circulation system",
      category: "mechanical",
      status: "maintenance",
      assignedTo: "Budi Santoso",
      assignedAvatar: "https://i.pravatar.cc/150?u=3",
      location: "Utility Room - Block C",
      department: "Mechanical",
      manufacturer: "Grundfos",
      installDate: "Jul 10, 2020",
      warrantyExpiry: "Jul 10, 2025",
      lastMaintenance: "Dec 12, 2024",
      nextMaintenance: "Mar 12, 2025",
      assetValue: "$15,000",
      serialNumber: "PUMP-WS-03-2020",
      condition: "fair",
      utilizationRate: 78,
    },
    {
      id: "AST-2024-004",
      name: "Fire Safety System",
      description:
        "Integrated fire detection, suppression and alarm system for all buildings",
      category: "safety",
      status: "operational",
      assignedTo: "Maya Sari",
      assignedAvatar: "https://i.pravatar.cc/150?u=4",
      location: "All Buildings",
      department: "Safety",
      manufacturer: "Johnson Controls",
      installDate: "Sep 05, 2019",
      warrantyExpiry: "Sep 05, 2024",
      lastMaintenance: "Dec 12, 2024",
      nextMaintenance: "Jan 12, 2025",
      assetValue: "$85,000",
      serialNumber: "FIRE-SYS-ALL-2019",
      condition: "excellent",
      utilizationRate: 95,
    },
    {
      id: "AST-2024-005",
      name: "Backup Power Generator",
      description:
        "Emergency diesel generator for critical power backup operations",
      category: "power",
      status: "standby",
      assignedTo: "Indra Kusuma",
      assignedAvatar: "https://i.pravatar.cc/150?u=5",
      location: "Generator Room - Basement",
      department: "Electrical",
      manufacturer: "Caterpillar",
      installDate: "Nov 15, 2021",
      warrantyExpiry: "Nov 15, 2026",
      lastMaintenance: "Nov 30, 2024",
      nextMaintenance: "Feb 28, 2025",
      assetValue: "$120,000",
      serialNumber: "GEN-001-2021",
      condition: "excellent",
      utilizationRate: 5,
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "HVAC":
        return "❄️";
      case "electrical":
        return "⚡";
      case "mechanical":
        return "⚙️";
      case "safety":
        return "🛡️";
      case "power":
        return "🔋";
      default:
        return "📦";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "success";
      case "good":
        return "primary";
      case "fair":
        return "warning";
      case "poor":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Asset Management
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 sm:flex-none min-w-0"
            color="default"
            size="sm"
            startContent={<Filter className="w-4 h-4" />}
            variant="flat"
          >
            <span className="hidden xs:inline">Filter</span>
          </Button>
          <Button
            className="flex-1 sm:flex-none min-w-0"
            color="default"
            size="sm"
            startContent={<Search className="w-4 h-4" />}
            variant="flat"
          >
            <span className="hidden xs:inline">Search</span>
          </Button>
          <Button
            className="flex-1 sm:flex-none min-w-0"
            color="primary"
            size="sm"
            startContent={<Plus className="w-4 h-4" />}
          >
            <span className="hidden xs:inline">Add Asset</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
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
      </div>

      {/* Asset Inventory Table */}
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-default-800">
              Asset Inventory
            </p>
            <p className="text-xs sm:text-small text-default-600">
              Complete asset registry and management overview
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="hidden sm:flex"
              color="default"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
              variant="flat"
            >
              Filter
            </Button>
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <div className="overflow-x-auto">
            <Table aria-label="Asset inventory table">
              <TableHeader>
                <TableColumn>ASSET</TableColumn>
                <TableColumn>OWNER</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>CONDITION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {assetInventory.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {asset.id}
                          </span>
                          <span className="text-xs">
                            {getCategoryIcon(asset.category)}
                          </span>
                        </div>
                        <p className="text-xs text-default-600 line-clamp-1">
                          {asset.name}
                        </p>
                        <p className="text-xs text-default-500">
                          S/N: {asset.serialNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <User
                        avatarProps={{
                          radius: "lg",
                          src: asset.assignedAvatar,
                          size: "sm",
                        }}
                        classNames={{
                          name: "text-sm font-medium",
                          description: "text-xs text-default-500",
                        }}
                        description={asset.department}
                        name={asset.assignedTo}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        className="capitalize"
                        color="default"
                        size="sm"
                        variant="flat"
                      >
                        {asset.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(asset.status) as any}
                        size="sm"
                        variant="dot"
                      >
                        {asset.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-default-500" />
                        <span className="text-sm">{asset.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip
                          color={getConditionColor(asset.condition) as any}
                          size="sm"
                          variant="flat"
                        >
                          {asset.condition}
                        </Chip>
                        <Progress
                          aria-label="Utilization rate"
                          className="max-w-16"
                          color={
                            asset.utilizationRate > 90
                              ? "danger"
                              : asset.utilizationRate > 70
                                ? "warning"
                                : "success"
                          }
                          size="sm"
                          value={asset.utilizationRate}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Asset actions">
                            <DropdownItem
                              key="view"
                              startContent={<Eye className="w-4 h-4" />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                            >
                              Edit Asset
                            </DropdownItem>
                            <DropdownItem
                              key="maintenance"
                              startContent={<Wrench className="w-4 h-4" />}
                            >
                              Log Maintenance
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                            >
                              Delete Asset
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        <Button isIconOnly size="sm" variant="flat">
                          <Activity className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
