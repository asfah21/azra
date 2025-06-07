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
  Wrench,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  MapPin,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Eye,
  Edit,
  Trash2,
  User as UserIcon,
  Building,
  Zap,
  Settings,
  CheckSquare,
  PauseCircle,
} from "lucide-react";

export default function WorkOrdersPage() {
  // Mock data untuk work orders
  const workOrderStats = {
    totalOrders: 847,
    pendingOrders: 156,
    inProgressOrders: 98,
    completedToday: 34,
    overdueOrders: 23,
    completionRate: 89.2,
    avgCompletionTime: 4.2,
  };

  const recentWorkOrders = [
    {
      id: "WO-2024-001",
      title: "AC Unit Maintenance - Building A",
      description: "Routine maintenance and filter replacement for HVAC system",
      priority: "medium",
      status: "in-progress",
      assignee: "Ahmad Ridwan",
      assigneeAvatar: "https://i.pravatar.cc/150?u=1",
      location: "Building A - Floor 3",
      department: "Maintenance",
      createdBy: "Facility Manager",
      createdAt: "2 hours ago",
      dueDate: "Dec 15, 2024",
      estimatedHours: 3,
      completedHours: 1.5,
      equipment: "HVAC-001",
      type: "preventive",
    },
    {
      id: "WO-2024-002",
      title: "Electrical Panel Inspection",
      description: "Monthly safety inspection of main electrical panel",
      priority: "high",
      status: "pending",
      assignee: "Siti Nurhaliza",
      assigneeAvatar: "https://i.pravatar.cc/150?u=2",
      location: "Main Building - Basement",
      department: "Electrical",
      createdBy: "Safety Officer",
      createdAt: "4 hours ago",
      dueDate: "Dec 14, 2024",
      estimatedHours: 2,
      completedHours: 0,
      equipment: "EL-PANEL-01",
      type: "inspection",
    },
    {
      id: "WO-2024-003",
      title: "Pump Repair - Water System",
      description: "Emergency repair for water circulation pump malfunction",
      priority: "urgent",
      status: "in-progress",
      assignee: "Budi Santoso",
      assigneeAvatar: "https://i.pravatar.cc/150?u=3",
      location: "Utility Room - Block C",
      department: "Mechanical",
      createdBy: "Operations Manager",
      createdAt: "6 hours ago",
      dueDate: "Dec 13, 2024",
      estimatedHours: 6,
      completedHours: 4,
      equipment: "PUMP-WS-03",
      type: "corrective",
    },
    {
      id: "WO-2024-004",
      title: "Fire Safety System Check",
      description: "Weekly testing of fire suppression and alarm systems",
      priority: "high",
      status: "completed",
      assignee: "Maya Sari",
      assigneeAvatar: "https://i.pravatar.cc/150?u=4",
      location: "All Buildings",
      department: "Safety",
      createdBy: "Safety Manager",
      createdAt: "1 day ago",
      dueDate: "Dec 12, 2024",
      estimatedHours: 4,
      completedHours: 4,
      equipment: "FIRE-SYS-ALL",
      type: "inspection",
    },
    {
      id: "WO-2024-005",
      title: "Generator Maintenance",
      description: "Quarterly maintenance for backup power generator",
      priority: "medium",
      status: "scheduled",
      assignee: "Indra Kusuma",
      assigneeAvatar: "https://i.pravatar.cc/150?u=5",
      location: "Generator Room",
      department: "Electrical",
      createdBy: "Facility Manager",
      createdAt: "2 days ago",
      dueDate: "Dec 20, 2024",
      estimatedHours: 5,
      completedHours: 0,
      equipment: "GEN-001",
      type: "preventive",
    },
  ];

  const priorityWorkOrders = [
    {
      id: "WO-2024-006",
      title: "Critical Server Room Cooling",
      priority: "urgent",
      assignee: "Ahmad Ridwan",
      assigneeAvatar: "https://i.pravatar.cc/150?u=1",
      dueDate: "Today",
      progress: 75,
      location: "Server Room",
    },
    {
      id: "WO-2024-007",
      title: "Elevator Safety Inspection",
      priority: "high",
      assignee: "Siti Nurhaliza",
      assigneeAvatar: "https://i.pravatar.cc/150?u=2",
      dueDate: "Tomorrow",
      progress: 0,
      location: "Building B",
    },
    {
      id: "WO-2024-008",
      title: "Lighting System Repair",
      priority: "high",
      assignee: "Budi Santoso",
      assigneeAvatar: "https://i.pravatar.cc/150?u=3",
      dueDate: "Dec 16",
      progress: 30,
      location: "Parking Area",
    },
    {
      id: "WO-2024-009",
      title: "Plumbing Leak Fix",
      priority: "medium",
      assignee: "Maya Sari",
      assigneeAvatar: "https://i.pravatar.cc/150?u=4",
      dueDate: "Dec 18",
      progress: 60,
      location: "Restroom B2",
    },
    {
      id: "WO-2024-010",
      title: "Security Camera Maintenance",
      priority: "medium",
      assignee: "Indra Kusuma",
      assigneeAvatar: "https://i.pravatar.cc/150?u=5",
      dueDate: "Dec 22",
      progress: 10,
      location: "Perimeter",
    },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "high":
        return <Zap className="w-4 h-4 text-warning" />;
      case "medium":
        return <Clock className="w-4 h-4 text-primary" />;
      case "low":
        return <Settings className="w-4 h-4 text-success" />;
      default:
        return <Settings className="w-4 h-4 text-default" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "primary";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "in-progress":
        return <Activity className="w-4 h-4 text-primary" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-secondary" />;
      case "on-hold":
        return <PauseCircle className="w-4 h-4 text-default" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <FileText className="w-4 h-4 text-default" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "primary";
      case "pending":
        return "warning";
      case "scheduled":
        return "secondary";
      case "on-hold":
        return "default";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "preventive":
        return "🔧";
      case "corrective":
        return "🚨";
      case "inspection":
        return "🔍";
      case "installation":
        return "⚙️";
      default:
        return "📋";
    }
  };

  const calculateProgress = (completed: number, estimated: number) => {
    if (estimated === 0) return 0;

    return Math.min((completed / estimated) * 100, 100);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Wrench className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Work Orders
            </h1>
            <p className="text-default-500 mt-1 text-sm sm:text-base">
              Manage maintenance tasks, repairs, and inspections
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="flex-1 sm:flex-initial"
            color="default"
            size="sm"
            startContent={<Filter className="w-4 h-4" />}
            variant="flat"
          >
            Filter
          </Button>
          <Button
            className="flex-1 sm:flex-initial"
            color="default"
            size="sm"
            startContent={<Search className="w-4 h-4" />}
            variant="flat"
          >
            Search
          </Button>
          <Button
            className="flex-1 sm:flex-initial"
            color="primary"
            size="sm"
            startContent={<Plus className="w-4 h-4" />}
          >
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Orders Card */}
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardHeader className="flex gap-2 sm:gap-3 pb-2">
            <div className="p-1.5 sm:p-2 bg-primary-500 rounded-lg">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm sm:text-lg font-semibold text-primary-800 truncate">
                Total Orders
              </p>
              <p className="text-xs sm:text-small text-primary-600">
                All Work Orders
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-primary-700">
                  {workOrderStats.totalOrders}
                </span>
                <Chip color="primary" size="sm" variant="flat">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active
                </Chip>
              </div>
              <p className="text-xs sm:text-small text-default-600">
                Total requests
              </p>
            </div>
          </CardBody>
        </Card>

        {/* In Progress Orders Card */}
        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardHeader className="flex gap-2 sm:gap-3 pb-2">
            <div className="p-1.5 sm:p-2 bg-success-500 rounded-lg">
              <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm sm:text-lg font-semibold text-success-800 truncate">
                In Progress
              </p>
              <p className="text-xs sm:text-small text-success-600">
                Active Tasks
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-success-700">
                  {workOrderStats.inProgressOrders}
                </span>
                <Badge
                  color="success"
                  content={workOrderStats.completedToday}
                  variant="flat"
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-success-500 rounded-full animate-pulse" />
                </Badge>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-small text-default-600">
                    Progress
                  </span>
                  <span className="text-xs sm:text-small font-medium">
                    {workOrderStats.completionRate}%
                  </span>
                </div>
                <Progress
                  className="max-w-full"
                  color="success"
                  size="sm"
                  value={workOrderStats.completionRate}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Pending Orders Card */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-2 sm:gap-3 pb-2">
            <div className="p-1.5 sm:p-2 bg-warning-500 rounded-lg">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm sm:text-lg font-semibold text-warning-800 truncate">
                Pending
              </p>
              <p className="text-xs sm:text-small text-warning-600">Awaiting</p>
            </div>
          </CardHeader>
          <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-warning-700">
                  {workOrderStats.pendingOrders}
                </span>
                <Chip
                  color="warning"
                  size="sm"
                  startContent={<UserIcon className="w-3 h-3" />}
                  variant="flat"
                >
                  Queue
                </Chip>
              </div>
              <p className="text-xs sm:text-small text-default-600">
                Need assignment
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Overdue Orders Card */}
        <Card className="bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
          <CardHeader className="flex gap-2 sm:gap-3 pb-2">
            <div className="p-1.5 sm:p-2 bg-danger-500 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm sm:text-lg font-semibold text-danger-800 truncate">
                Overdue
              </p>
              <p className="text-xs sm:text-small text-danger-600">Past Due</p>
            </div>
          </CardHeader>
          <CardBody className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xl sm:text-2xl font-bold text-danger-700">
                  {workOrderStats.overdueOrders}
                </span>
                <Chip
                  color="danger"
                  size="sm"
                  startContent={<Calendar className="w-3 h-3" />}
                  variant="flat"
                >
                  Late
                </Chip>
              </div>
              <p className="text-xs sm:text-small text-default-600">
                Need attention
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Recent Work Orders */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-default-50 to-default-100">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-default-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-default-800">
                Recent Work Orders
              </p>
              <p className="text-xs sm:text-small text-default-600">
                Latest maintenance requests and updates
              </p>
            </div>
            <Button
              className="hidden sm:flex"
              color="primary"
              endContent={<Eye className="w-4 h-4" />}
              size="sm"
              variant="flat"
            >
              View All
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="px-3 sm:px-6 py-4">
            <div className="space-y-3 sm:space-y-4">
              {recentWorkOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-default-100 transition-colors"
                >
                  <Avatar
                    isBordered
                    className="flex-shrink-0"
                    color={getStatusColor(order.status) as any}
                    size="md"
                    src={order.assigneeAvatar}
                  />
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-default-700 text-sm sm:text-base">
                          {order.title}
                        </p>
                        <Chip
                          color={getPriorityColor(order.priority) as any}
                          size="sm"
                          startContent={getPriorityIcon(order.priority)}
                          variant="flat"
                        >
                          {order.priority}
                        </Chip>
                        <Chip
                          color={getStatusColor(order.status) as any}
                          size="sm"
                          variant="dot"
                        >
                          {order.status}
                        </Chip>
                      </div>
                    </div>
                    <p className="text-xs sm:text-small text-default-600 mb-2 line-clamp-2">
                      {order.description}
                    </p>

                    {/* Progress Bar for in-progress orders */}
                    {order.status === "in-progress" && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-default-500 mb-1">
                          <span>
                            Progress: {order.completedHours}h /{" "}
                            {order.estimatedHours}h
                          </span>
                          <span>
                            {Math.round(
                              calculateProgress(
                                order.completedHours,
                                order.estimatedHours,
                              ),
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          color="primary"
                          size="sm"
                          value={calculateProgress(
                            order.completedHours,
                            order.estimatedHours,
                          )}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs text-default-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span className="truncate">{order.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{order.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{order.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="truncate">{order.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                    <div className="text-center">
                      <div className="text-xs font-medium text-default-600">
                        {order.id}
                      </div>
                      <div className="text-xs text-default-400">
                        {getTypeIcon(order.type)} {order.type}
                      </div>
                    </div>
                    {getStatusIcon(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Priority Work Orders */}
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardHeader className="flex gap-3">
            <div className="p-2 bg-warning-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-lg sm:text-xl font-semibold text-warning-800">
                Priority Orders
              </p>
              <p className="text-xs sm:text-small text-warning-600">
                High priority and urgent tasks
              </p>
            </div>
          </CardHeader>
          <Divider className="bg-warning-200" />
          <CardBody className="px-3 sm:px-6 py-4">
            <div className="space-y-3 sm:space-y-4">
              {priorityWorkOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="text-center flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        order.priority === "urgent"
                          ? "bg-danger-500"
                          : order.priority === "high"
                            ? "bg-warning-500"
                            : "bg-primary-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar size="sm" src={order.assigneeAvatar} />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          order.priority === "urgent"
                            ? "bg-danger-500"
                            : order.priority === "high"
                              ? "bg-warning-500"
                              : "bg-primary-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-default-700 truncate text-sm">
                        {order.title}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Chip
                          color={getPriorityColor(order.priority) as any}
                          size="sm"
                          variant="flat"
                        >
                          {order.priority}
                        </Chip>
                        <span className="text-xs text-default-500">
                          {order.location}
                        </span>
                      </div>
                      {order.progress > 0 && (
                        <div className="mt-1">
                          <Progress
                            color={getPriorityColor(order.priority) as any}
                            size="sm"
                            value={order.progress}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-medium text-default-600">
                      {order.dueDate}
                    </div>
                    <div className="text-xs text-default-400">
                      {order.progress}% done
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 bg-default-500 rounded-lg">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold text-default-800">
              All Work Orders
            </p>
            <p className="text-xs sm:text-small text-default-600">
              Complete work order management and tracking
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
              New Order
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <div className="overflow-x-auto">
            <Table aria-label="Work orders table">
              <TableHeader>
                <TableColumn>ORDER</TableColumn>
                <TableColumn>ASSIGNEE</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>DUE DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {recentWorkOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {order.id}
                          </span>
                          <span className="text-xs">
                            {getTypeIcon(order.type)}
                          </span>
                        </div>
                        <p className="text-xs text-default-600 line-clamp-1">
                          {order.title}
                        </p>
                        <p className="text-xs text-default-500">
                          Equipment: {order.equipment}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <User
                        avatarProps={{
                          radius: "lg",
                          src: order.assigneeAvatar,
                          size: "sm",
                        }}
                        classNames={{
                          description: "text-default-500",
                        }}
                        description={order.department}
                        name={order.assignee}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getPriorityColor(order.priority) as any}
                        size="sm"
                        startContent={getPriorityIcon(order.priority)}
                        variant="flat"
                      >
                        {order.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          color={getStatusColor(order.status) as any}
                          size="sm"
                          variant="dot"
                        >
                          {order.status}
                        </Chip>
                        {order.status === "in-progress" && (
                          <Progress
                            className="max-w-20"
                            color="primary"
                            size="sm"
                            value={calculateProgress(
                              order.completedHours,
                              order.estimatedHours,
                            )}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        <p className="font-medium">{order.location}</p>
                        <p className="text-default-500 text-xs">
                          {order.equipment}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        <p className="font-medium">{order.dueDate}</p>
                        <p className="text-default-500 text-xs">
                          {order.estimatedHours}h est.
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative flex items-center gap-2">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="details"
                              startContent={<Eye className="w-4 h-4" />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                            >
                              Edit Order
                            </DropdownItem>
                            <DropdownItem
                              key="completed"
                              startContent={<CheckSquare className="w-4 h-4" />}
                            >
                              Mark Complete
                            </DropdownItem>
                            <DropdownItem
                              key="reassign"
                              startContent={<UserIcon className="w-4 h-4" />}
                            >
                              Reassign
                            </DropdownItem>
                            <DropdownItem
                              key="cancel"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                            >
                              Cancel Order
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
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
