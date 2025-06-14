"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Progress,
} from "@heroui/react";
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MapPin,
  PauseCircle,
  Settings,
  UserIcon,
  XCircle,
  Zap,
} from "lucide-react";

export default function WoMainGrid() {
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

  const calculateProgress = (completed: number, estimated: number) => {
    if (estimated === 0) return 0;

    return Math.min((completed / estimated) * 100, 100);
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

  return (
    <>
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
    </>
  );
}
