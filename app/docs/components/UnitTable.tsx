"use client";

import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Chip,
  Button,
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
  Input,
  Select,
  SelectItem,
  Pagination,
  User,
} from "@heroui/react";
import {
  Package,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Search,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";

import { title } from "@/components/primitives";

// Types
interface Unit {
  id: string;
  assetTag: string;
  name: string;
  description?: string;
  status: "operational" | "maintenance" | "breakdown" | "retired";
  condition?: "excellent" | "good" | "fair" | "poor";
  serialNumber?: string;
  location: string;
  department?: string;
  manufacturer?: string;
  installDate?: Date;
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  assetValue?: number;
  utilizationRate?: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
  createdById: string;
  assignedToId?: string;
  category: {
    id: number;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  };
}

interface UnitsTableProps {
  unitsTable: Unit[];
}

const statusColorMap = {
  operational: "success",
  maintenance: "warning",
  breakdown: "danger",
  retired: "default",
} as const;

const conditionColorMap = {
  excellent: "success",
  good: "primary",
  fair: "warning",
  poor: "danger",
} as const;

const statusOptions = [
  { key: "all", label: "Semua Status" },
  { key: "operational", label: "Operational" },
  { key: "maintenance", label: "Maintenance" },
  { key: "breakdown", label: "Breakdown" },
  { key: "retired", label: "Retired" },
];

// Status label mapping
const getStatusLabel = (status: string): string => {
  switch (status) {
    case "operational":
      return "Operasional";
    case "maintenance":
      return "Maintenance";
    case "breakdown":
      return "Breakdown";
    case "retired":
      return "Retired";
    default:
      return status;
  }
};

const getConditionLabel = (condition?: string): string => {
  if (!condition) return "-";
  switch (condition) {
    case "excellent":
      return "Sangat Baik";
    case "good":
      return "Baik";
    case "fair":
      return "Cukup";
    case "poor":
      return "Buruk";
    default:
      return condition;
  }
};

export default function UnitsTables({ unitsTable }: UnitsTableProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  // State untuk filtering dan pagination
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleUnitAdded = () => {
    router.refresh();
    onOpenChange();
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    let filteredUnits = [...unitsTable];

    if (filterValue) {
      filteredUnits = filteredUnits.filter(
        (unit) =>
          unit.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          unit.assetTag.toLowerCase().includes(filterValue.toLowerCase()) ||
          unit.location.toLowerCase().includes(filterValue.toLowerCase()) ||
          unit.category.name
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          (unit.department &&
            unit.department.toLowerCase().includes(filterValue.toLowerCase())),
      );
    }

    if (statusFilter !== "all") {
      filteredUnits = filteredUnits.filter(
        (unit) => unit.status === statusFilter,
      );
    }

    return filteredUnits;
  }, [unitsTable, filterValue, statusFilter]);

  // Pagination
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const onSearchChange = (value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className={title({ class: "mb-2" })}>Daftar Unit</h1>
          <p className="text-default-500">
            Kelola dan pantau semua unit aset perusahaan
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-3 flex-1 justify-start self-start">
              <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col flex-1 text-left">
                <p className="text-xl font-semibold text-default-800 text-left">
                  Unit Management
                </p>
                <p className="text-small text-default-600 text-left">
                  Total {unitsTable.length} unit terdaftar
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                isClearable
                className="w-full sm:max-w-[300px]"
                placeholder="Cari unit, asset tag, lokasi..."
                startContent={<Search className="w-4 h-4" />}
                value={filterValue}
                onClear={() => setFilterValue("")}
                onValueChange={onSearchChange}
              />
              <Select
                className="w-full sm:w-[150px]"
                placeholder="Status"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;

                  setStatusFilter(selectedKey);
                  setPage(1);
                }}
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.key}>{status.label}</SelectItem>
                ))}
              </Select>
              <Button
                className="flex-1 sm:flex-none"
                color="primary"
                size="sm"
                startContent={<Plus className="w-4 h-4" />}
                onPress={onOpen}
              >
                Tambah Unit
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="px-0 overflow-x-auto">
            <Table aria-label="Units table">
              <TableHeader>
                <TableColumn>UNIT INFO</TableColumn>
                <TableColumn>KATEGORI</TableColumn>
                <TableColumn>LOKASI</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>KONDISI</TableColumn>
                <TableColumn>NILAI ASET</TableColumn>
                <TableColumn>ASSIGNED TO</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Tidak ada unit ditemukan">
                {items.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">{unit.name}</p>
                        <p className="text-tiny text-default-500">
                          {unit.assetTag}
                        </p>
                        {unit.serialNumber && (
                          <p className="text-tiny text-default-400">
                            SN: {unit.serialNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">
                          {unit.category.name}
                        </p>
                        {unit.manufacturer && (
                          <p className="text-tiny text-default-500">
                            {unit.manufacturer}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{unit.location}</p>
                        {unit.department && (
                          <p className="text-tiny text-default-500">
                            {unit.department}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={statusColorMap[unit.status]}
                        size="sm"
                        variant="flat"
                      >
                        {getStatusLabel(unit.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {unit.condition ? (
                        <Chip
                          color={conditionColorMap[unit.condition]}
                          size="sm"
                          variant="dot"
                        >
                          {getConditionLabel(unit.condition)}
                        </Chip>
                      ) : (
                        <span className="text-default-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">
                          {formatCurrency(unit.assetValue)}
                        </p>
                        {unit.utilizationRate && (
                          <p className="text-tiny text-default-500">
                            {unit.utilizationRate}% utilized
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {unit.assignedTo ? (
                        <User
                          avatarProps={{
                            radius: "lg",
                            size: "sm",
                          }}
                          classNames={{
                            description: "text-default-500",
                          }}
                          description="Assigned"
                          name={unit.assignedTo.name}
                        />
                      ) : (
                        <span className="text-default-400 text-sm">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">
                          {formatDate(unit.createdAt)}
                        </p>
                        <p className="text-tiny text-default-500">
                          {unit.createdBy.name}
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
                              key="view"
                              startContent={<Eye className="w-4 h-4" />}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="w-4 h-4" />}
                            >
                              Edit Unit
                            </DropdownItem>
                            <DropdownItem
                              key="maintenance"
                              startContent={<Calendar className="w-4 h-4" />}
                            >
                              Schedule Maintenance
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                            >
                              Delete Unit
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>

          {/* Pagination */}
          {pages > 1 && (
            <>
              <Divider />
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-small text-default-500">
                    Showing {(page - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(page * rowsPerPage, filteredItems.length)} of{" "}
                    {filteredItems.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-small text-default-500">
                    Rows per page:
                  </span>
                  <Select
                    className="w-20"
                    selectedKeys={[rowsPerPage.toString()]}
                    size="sm"
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;

                      setRowsPerPage(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectItem key="5">5</SelectItem>
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="15">15</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                  </Select>
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Modal untuk Add Unit - Anda bisa buat komponen AddUnitForm serupa dengan AddUserForms */}
      <div className="mx-4">
        <Modal
          isOpen={isOpen}
          placement="top-center"
          size="5xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tambah Unit Baru</h3>
                <p className="text-default-500">
                  Form tambah unit akan ada di sini (bisa import dari form yang
                  sudah ada)
                </p>
                <div className="flex justify-end gap-2 mt-6">
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Save Unit
                  </Button>
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
