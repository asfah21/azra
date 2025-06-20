"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
  Progress,
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
  useDisclosure,
  Modal,
  ModalContent,
} from "@heroui/react";
import {
  Wrench,
  Clock,
  AlertTriangle,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User as UserIcon,
  Zap,
  Settings,
  CheckSquare,
  PlusIcon,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { AddWoForm } from "./AddForm";

interface BreakdownPayload {
  id: string;
  breakdownNumber: string;
  description: string;
  breakdownTime: Date;
  workingHours: number;
  status: 'pending' | 'in_progress' | 'rfu' | 'overdue';
  createdAt: Date;
  unitId: string;
  reportedById: string;
  unit: {
    id: string;
    assetTag: string;
    name: string;
    location: string;
    department: string | null;  // Updated to allow null
    categoryId: number;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  components: {
    id: string;
    component: string;
    subcomponent: string;
  }[];
  rfuReport?: {
    id: string;
    solution: string;
    resolvedAt: Date;
    resolvedById: string;
    resolvedBy: {
      id: string;
      name: string;
    };
  } | null;
}

interface ManagementClientProps {
  dataTable: BreakdownPayload[];
}

export default function WoUserTable({dataTable}: ManagementClientProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
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
    <>
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
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add WO
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
              {dataTable.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{order.breakdownNumber ?? "Not Found!"}</span>
                        <span className="text-xs">
                          {getTypeIcon(order.unit.assetTag)}
                        </span>
                      </div>
                      <p className="text-xs text-default-600 line-clamp-1">
                        {order.unit.name}
                      </p>
                      <p className="text-xs text-default-500">
                        Asset ID: {order.unit.assetTag}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <User
                      avatarProps={{
                        radius: "lg",
                        // src: order.assigneeAvatar,
                        size: "sm",
                      }}
                      classNames={{
                        description: "text-default-500",
                      }}
                      description={order.unit.department}
                      name={order.reportedBy.name}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      // color={getPriorityColor(order.priority) as any}
                      color="primary"
                      size="sm"
                      // startContent={getPriorityIcon(order.priority)}
                      variant="flat"
                    >
                      {/* {order.priority} */} <p>RFU</p>
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
                      {/* {order.status === "in-progress" && (
                        <Progress
                          className="max-w-20"
                          color="primary"
                          size="sm"
                          value={calculateProgress(
                            order.completedHours,
                            order.estimatedHours,
                          )}
                        />
                      )} */} <p>Est</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      {/* <p className="font-medium">{order.location}</p> */}<p>Location</p>
                      <p className="text-default-500 text-xs">
                        {/* {order.equipment} */} Equipment
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      {/* <p className="font-medium">{order.dueDate}</p> */}<p>Order</p>
                      <p className="text-default-500 text-xs">
                        {/* {order.estimatedHours}h est. */}est.
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
    {/* Modal */}
    <div className="mx-4">
        <Modal
          isOpen={isOpen}
          placement="top-center"
          size="2xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <AddWoForm onClose={onClose} onBreakdownAdded={handleUserAdded} />
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
