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
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
  Input,
} from "@heroui/react";
import {
  Wrench,
  Clock,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Zap,
  CheckSquare,
  PlusIcon,
  Search,
  MapPin,
  CircleCheckBig,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  TbCircleDashedLetterH,
  TbCircleDashedLetterL,
  TbCircleDashedLetterM,
} from "react-icons/tb";

import { BreakdownPayload } from "../types";
import { useOptimisticWorkOrders } from "../actions/optimisticActions";

import { AddWoForm } from "./AddForm";
import BreakdownDetailModal from "./BreakdownDetailModal";
import RFUReportActionModal from "./RFUReportActionModal";
import InProgressModal from "./InProgressModal";

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

  // State untuk modal RFU
  const [isRFUModalOpen, setIsRFUModalOpen] = useState(false);
  const [selectedBreakdownForRFU, setSelectedBreakdownForRFU] =
    useState<BreakdownPayload | null>(null);

  // State untuk pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // State untuk search
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk modal In Progress
  const [isInProgressModalOpen, setIsInProgressModalOpen] = useState(false);
  const [selectedBreakdownForInProgress, setSelectedBreakdownForInProgress] =
    useState<BreakdownPayload | null>(null);

  // State untuk modal konfirmasi delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBreakdownForDelete, setSelectedBreakdownForDelete] =
    useState<BreakdownPayload | null>(null);

  const {
    optimisticWorkOrders,
    optimisticUpdateStatus,
    optimisticUpdateWithUnitStatus,
    optimisticDelete,
  } = useOptimisticWorkOrders(dataTable);

  // Gunakan optimisticWorkOrders sebagai data utama
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return optimisticWorkOrders;
    }

    const query = searchQuery.toLowerCase();

    return optimisticWorkOrders.filter((item) => {
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
  }, [optimisticWorkOrders, searchQuery]);

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

  const handleMarkAsRfu = (breakdown: BreakdownPayload) => {
    setSelectedBreakdownForRFU(breakdown);
    setIsRFUModalOpen(true);
  };

  const handleRFUComplete = async (
    _solution: string,
    _actions: Array<{ action: string; description: string }>,
  ) => {
    if (!selectedBreakdownForRFU) return;

    try {
      await optimisticUpdateStatus(
        selectedBreakdownForRFU.id,
        "rfu",
        session?.user?.id,
      );

      setIsRFUModalOpen(false);
      setSelectedBreakdownForRFU(null);

      // Refresh halaman untuk mendapatkan data terbaru
      router.refresh();
    } catch (error) {
      console.error("Error completing RFU:", error);
    }
  };

  const handleMarkAsInProgress = (breakdown: BreakdownPayload) => {
    setSelectedBreakdownForInProgress(breakdown);
    setIsInProgressModalOpen(true);
  };

  const handleInProgressComplete = async (
    unitStatus: string,
    notes?: string,
  ) => {
    if (!selectedBreakdownForInProgress) return;

    try {
      await optimisticUpdateWithUnitStatus(
        selectedBreakdownForInProgress.id,
        "in_progress",
        unitStatus,
        notes,
        session?.user?.id,
      );

      setIsInProgressModalOpen(false);
      setSelectedBreakdownForInProgress(null);

      // Refresh halaman untuk mendapatkan data terbaru
      router.refresh();
    } catch (error) {
      console.error("Error completing in progress:", error);
    }
  };

  const handleCloseInProgressModal = () => {
    setIsInProgressModalOpen(false);
    setSelectedBreakdownForInProgress(null);
  };

  const handleDelete = (breakdown: BreakdownPayload) => {
    // Validasi role user sebelum membuka modal
    if (session?.user?.role !== "super_admin") {
      console.error("Unauthorized: Only super_admin can delete work orders");

      return;
    }

    setSelectedBreakdownForDelete(breakdown);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBreakdownForDelete) return;

    try {
      await optimisticDelete(selectedBreakdownForDelete.id);

      setIsDeleteModalOpen(false);
      setSelectedBreakdownForDelete(null);

      // Refresh halaman untuk mendapatkan data terbaru
      router.refresh();
    } catch (error) {
      console.error("Error deleting breakdown:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedBreakdownForDelete(null);
  };

  const handleUserAdded = () => {
    onOpenChange();
    // Refresh halaman untuk mendapatkan data terbaru
    router.refresh();
  };

  const handleViewDetails = (breakdown: BreakdownPayload) => {
    setSelectedBreakdown(breakdown);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBreakdown(null);
  };

  const handleCloseRFUModal = () => {
    setIsRFUModalOpen(false);
    setSelectedBreakdownForRFU(null);
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
      case "high":
        return <TbCircleDashedLetterH className="w-4 h-4 text-danger" />;
      case "medium":
        return <TbCircleDashedLetterM className="w-4 h-4 text-warning" />;
      case "low":
        return <TbCircleDashedLetterL className="w-4 h-4 text-success" />;
      default:
        return <TbCircleDashedLetterL className="w-4 h-4 text-success" />;
    }
  };

  const getWoIcon = (status: string | null) => {
    switch (status) {
      case "rfu":
        return <CircleCheckBig className="w-3 h-3 text-primary" />;
      case "in_progress":
        return <Zap className="w-3 h-3 text-success" />;
      case "pending":
        return <Clock className="w-3 h-3 text-warning" />;
      default:
        return <Clock className="w-3 h-3 text-danger" />;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "success";
    }
  };

  const getColorStatus = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "rfu":
        return <span className="text-primary">completed</span>;
      case "in_progress":
        return <span className="text-success">in-progress</span>;
      case "pending":
        return <span className="text-warning">pending</span>;
      case "overdue":
        return <span className="text-danger">overdue</span>;
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "pending" | "in_progress" | "rfu" | "overdue",
  ) => {
    try {
      await optimisticUpdateStatus(id, status);
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Gunakan optimistic data untuk rendering
  const displayData = optimisticWorkOrders;

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
                <TableColumn>REPORTED BY</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>STATUS UNIT</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>STATUS WO</TableColumn>
                <TableColumn>DATE</TableColumn>
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
                          src: order.reportedBy.photo || undefined,
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
                        {order.priority ?? "low"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getColorStatus(order.unit.status) as any}
                        size="sm"
                        variant="dot"
                      >
                        {order.unit.status ?? "n/a"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="">
                        <p className="flex items-center gap-1">
                          <MapPin className="text-red-500 w-3 h-3" />
                          {order.unit.location}
                        </p>
                        <p className="capitalize text-default-500 text-xs pl-4 ">
                          Shift {order.shift ?? "n/a"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Chip
                          color={getStatusColor(order.status) as any}
                          size="sm"
                          startContent={getWoIcon(order.status)}
                          variant="dot"
                        >
                          {getStatusLabel(order.status)}
                        </Chip>
                        {order.status === "in_progress" &&
                          order.inProgressBy && (
                            <div className="ml-2 text-xs text-default-500">
                              By {order.inProgressBy.name}
                              {/* {order.inProgressAt && (
                              <span className="ml-2">
                                {new Date(order.inProgressAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "2-digit",
                                  year: "2-digit",
                                })}
                              </span>
                            )} */}
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
                                className="text-primary"
                                color="primary"
                                startContent={
                                  <CheckSquare className="w-4 h-4" />
                                }
                                onPress={() => handleMarkAsRfu(order)}
                              >
                                Mark as RFU
                              </DropdownItem>
                            ) : null}
                            {order.status === "pending" ? (
                              <DropdownItem
                                key="in-progress"
                                className="text-success"
                                color="success"
                                startContent={<Clock className="w-4 h-4" />}
                                onPress={() => handleMarkAsInProgress(order)}
                              >
                                Mark as In Progress
                              </DropdownItem>
                            ) : null}

                            {session?.user?.role === "super_admin" ? (
                              <DropdownItem
                                key="cancel"
                                className="text-danger"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
                                onPress={() => handleDelete(order)}
                              >
                                Delete Order
                              </DropdownItem>
                            ) : null}

                            {/* <DropdownItem
                              key="cancel"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDelete(order.id)}
                            >
                              Delete Order
                            </DropdownItem> */}
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

      {/* RFU Report Action Modal */}
      <RFUReportActionModal
        breakdownId={selectedBreakdownForRFU?.id || ""}
        breakdownNumber={selectedBreakdownForRFU?.breakdownNumber || ""}
        isOpen={isRFUModalOpen}
        onClose={handleCloseRFUModal}
        onRFUComplete={handleRFUComplete}
      />

      {/* In Progress Modal */}
      <InProgressModal
        breakdownNumber={selectedBreakdownForInProgress?.breakdownNumber || ""}
        isOpen={isInProgressModalOpen}
        unitAssetTag={selectedBreakdownForInProgress?.unit.assetTag || ""}
        unitName={selectedBreakdownForInProgress?.unit.name || ""}
        onClose={handleCloseInProgressModal}
        onConfirm={handleInProgressComplete}
      />

      {/* Modal konfirmasi delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        placement="center"
        size="sm"
        onOpenChange={setIsDeleteModalOpen}
      >
        <ModalContent>
          {(_onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-danger" />
                  <span>Konfirmasi Hapus</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p>
                  Apakah Anda yakin ingin menghapus work order{" "}
                  <span className="font-semibold">
                    {selectedBreakdownForDelete?.breakdownNumber}
                  </span>
                  ?
                </p>
                <p className="text-sm text-default-500">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="flat"
                  onPress={handleCloseDeleteModal}
                >
                  Batal
                </Button>
                <Button color="danger" onPress={handleConfirmDelete}>
                  Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
