"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
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
  Progress,
  Pagination,
  Input,
} from "@heroui/react";
import {
  Wrench,
  Clock,
  AlertTriangle,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Zap,
  Settings,
  CheckSquare,
  PlusIcon,
  Search,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";

import { deleteBreakdown, updateBreakdownStatus } from "../action";

import { AddWoForm } from "./AddForm";
import BreakdownDetailModal from "./BreakdownDetailModal";

// Tambahkan import untuk mendapatkan current user

interface BreakdownPayload {
  id: string;
  breakdownNumber: string | null;
  description: string;
  breakdownTime: Date;
  workingHours: number;
  status: "pending" | "in_progress" | "rfu" | "overdue";
  priority: string | null;
  createdAt: Date;
  unitId: string;
  reportedById: string;
  shift: string | null;
  unit: {
    id: string;
    assetTag: string;
    name: string;
    location: string;
    department: string | null; // Updated to allow null
    categoryId: number;
    status: string;
  };
  reportedBy: {
    id: string;
    name: string;
    email: string;
    department: string | null;
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

interface WoStatsCardsProps {
  dataTable: BreakdownPayload[];
}

export default function GammaTableData({ dataTable }: WoStatsCardsProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { data: session } = useSession();

  // State untuk modal detail
  const [selectedBreakdown, setSelectedBreakdown] =
    useState<BreakdownPayload | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // State untuk pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // State untuk search
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data berdasarkan search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return dataTable;
    }

    const query = searchQuery.toLowerCase();

    return dataTable.filter((item) => {
      return (
        item.breakdownNumber?.toLowerCase().includes(query) ||
        item.unit.name.toLowerCase().includes(query) ||
        item.unit.assetTag.toLowerCase().includes(query) ||
        item.reportedBy.name.toLowerCase().includes(query) ||
        item.unit.department?.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.priority?.toLowerCase().includes(query)
      );
    });
  }, [dataTable, searchQuery]);

  // Hitung data yang akan ditampilkan berdasarkan halaman
  const pages = Math.ceil(filteredData.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredData.slice(start, end);
  }, [page, filteredData]);

  // Reset page ketika search berubah
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset ke halaman pertama ketika search berubah
  };

  const handleAction = async (action: () => Promise<any>) => {
    try {
      const result = await action();

      if (result.success) {
        // Mungkin bisa ditambahkan notifikasi sukses di sini
        console.log(result.message);
      } else {
        // Mungkin bisa ditambahkan notifikasi error di sini
        console.error(result.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleMarkAsRfu = (id: string) => {
    if (window.confirm("Are you sure you want to mark this as RFU?")) {
      // Gunakan ID user yang sedang login
      const currentUserId = session?.user?.id;

      if (currentUserId) {
        handleAction(() => updateBreakdownStatus(id, "rfu", currentUserId));
      } else {
        handleAction(() => updateBreakdownStatus(id, "rfu"));
      }
    }
  };

  const handleMarkAsInProgress = (id: string) => {
    if (window.confirm("Are you sure you want to mark this as In Progress?")) {
      // Gunakan ID user yang sedang login
      const currentUserId = session?.user?.id;

      if (currentUserId) {
        handleAction(() =>
          updateBreakdownStatus(id, "in_progress", currentUserId),
        );
      } else {
        handleAction(() => updateBreakdownStatus(id, "in_progress"));
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      handleAction(() => deleteBreakdown(id));
    }
  };

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
  };

  const handleViewDetails = (breakdown: BreakdownPayload) => {
    setSelectedBreakdown(breakdown);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBreakdown(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rfu":
        return "primary";
      case "in_progress":
        return "success";
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

  const getPriorityIcon = (priority: string | null) => {
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
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string | null) => {
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
        return "primary";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "operational":
        return "success";
      case "standby":
        return "warning";
      case "breakdown":
        return "danger";
      default:
        return "default";
    }
  };

  const getProgressLabel = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <p className="flex items-center text-xs text-success">Operational</p>
        );
      case "standby":
        return (
          <p className="flex items-center text-xs text-warning">Standby</p>
        );
      case "breakdown":
        return (
          <p className="flex items-center text-xs text-danger">Breakdown</p>
        );
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "rfu":
        return "completed";
      case "in_progress":
        return "in-progress";
      case "pending":
        return "pending";
      case "overdue":
        return "overdue";
      default:
        return status;
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xl font-semibold text-default-800 text-left">
                All Work Orders
              </p>
              <p className="text-xs sm:text-small text-default-600">
                Complete work order management
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Search work orders..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onValueChange={handleSearchChange}
            />
            <Button
              className="flex-1 sm:flex-none"
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
          {/* Search input untuk mobile */}
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Search work orders..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onValueChange={handleSearchChange}
            />
          </div>
          <div className="overflow-x-auto">
            <Table
              aria-label="Work orders table"
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>ORDER</TableColumn>
                <TableColumn>ASSIGNEE</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CREATED AT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {order.breakdownNumber ?? "Not Found!"}
                          </span>
                          <span className="text-xs">
                            {getTypeIcon(order.unit.assetTag)}
                          </span>
                        </div>
                        <p className="text-xs text-default-600 line-clamp-1">
                          {order.unit.name}
                        </p>
                        <p className="text-xs text-default-500">
                          ID: {order.unit.assetTag}
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
                        description={order.reportedBy.department}
                        name={order.reportedBy.name}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getPriorityColor(order.priority) as any}
                        size="sm"
                        startContent={getPriorityIcon(order.priority)}
                        variant="flat"
                      >
                        {order.priority ?? "medium"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="">                        
                        <p className="flex items-center gap-1">
                          <MapPin className="text-red-500 w-3 h-3" />
                          {order.unit.location}
                        </p>
                        <p className="capitalize text-default-500 text-xs pl-4 ">Shift {order.shift ?? "n/a"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          color={getStatusColor(order.status) as any}
                          size="sm"
                          variant="dot"
                        >
                          {getStatusLabel(order.status)}
                        </Chip>
                        {(order.status === "in_progress" ||
                          order.status === "rfu" ||
                          order.status === "pending") && (
                          <div className="flex items-center gap-1">
                            <Progress
                              className="max-w-3"
                              color={getProgressColor(order.unit.status) as any}
                              size="sm"
                              value={100}
                            />
                            <div className="text-xs text-default-500">
                              {getProgressLabel(order.unit.status)}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-small">
                        {/* <p className="font-medium">{order.dueDate}</p> */}
                        <p>
                          {order.breakdownTime.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </p>
                        <p className="text-default-500 text-xs">
                          {order.breakdownTime.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
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
                              onPress={() => handleViewDetails(order)}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              isDisabled
                              startContent={<Edit className="w-4 h-4" />}
                              onPress={() =>
                                router.push(`/dashboard/gamma/${order.id}/edit`)
                              }
                            >
                              Edit Order
                            </DropdownItem>
                            {order.status === "in_progress" ? (
                              <DropdownItem
                                key="completed"
                                startContent={
                                  <CheckSquare className="w-4 h-4" />
                                }
                                onPress={() => handleMarkAsRfu(order.id)}
                              >
                                Mark as RFU
                              </DropdownItem>
                            ) : null}
                            {order.status === "pending" ? (
                              <DropdownItem
                                key="in-progress"
                                startContent={<Clock className="w-4 h-4" />}
                                onPress={() => handleMarkAsInProgress(order.id)}
                              >
                                Mark as In Progress
                              </DropdownItem>
                            ) : null}
                            {/* <DropdownItem
                                                            key="reassign"
                                                            startContent={<UserIcon className="w-4 h-4" />}
                                                            isDisabled
                                                        >
                                                            Reassign
                                                        </DropdownItem> */}
                            <DropdownItem
                              key="cancel"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDelete(order.id)}
                            >
                              Delete Order
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
              <AddWoForm onBreakdownAdded={handleUserAdded} onClose={onClose} />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal untuk Detail Breakdown */}
      <BreakdownDetailModal
        breakdown={selectedBreakdown}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
