// optimasi versi #1
"use client";

import {
  Modal,
  ModalContent,
  Progress,
  useDisclosure,
  Input,
  Pagination,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useState,
  useMemo,
  useCallback,
  useDeferredValue,
  startTransition,
} from "react";
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
} from "@heroui/react";
import {
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Wrench,
  Package,
  Search,
  Download,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";

import { AddForms } from "./AddForm";
import AssetDetailModal from "./AssetDetailModal";
import { EditAssetModal } from "./EditAssetModal";
import { ImportAssetModal } from "./ImportAssetModal";
import { DeleteAssetModal } from "./DeleteAssetModal";
import MaintenanceLogModal from "./MaintenanceLogModal";

// Interface untuk Unit
interface Unit {
  id: string;
  assetTag: string;
  name: string;
  description: string | null;
  categoryId: number;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  location: string;
  department: string | null;
  manufacturer: string | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  assetValue: number | null;
  utilizationRate: number | null;
  createdAt: Date;
  createdById: string;
  assignedToId: string | null;
}

interface ManagementClientProps {
  dataTable: Unit[];
  users: Array<{ id: string; name: string; photo: string }>;
}

// Constants - pindahkan keluar dari component untuk mencegah re-creation
const ROWS_PER_PAGE = 10;
const SEARCH_FIELDS = [
  "assetTag",
  "name",
  "serialNumber",
  "location",
  "department",
  "manufacturer",
  "status",
  "condition",
] as const;

// Helper functions - ekstrak keluar dari component
const getCategoryName = (category: number): string => {
  const categories = {
    1: "Alat Berat",
    2: "Elektronik",
  } as const;

  return categories[category as keyof typeof categories] || "Lainnya";
};

const getCategoryIcon = (category: number): string => {
  const icons = {
    1: "🚜",
    2: "💻",
  } as const;

  return icons[category as keyof typeof icons] || "📦";
};

const getStatusColor = (status: string) => {
  const statusColors = {
    Critical: "danger",
    critical: "danger",
    Warning: "warning",
    warning: "warning",
    Maintenance: "primary",
    maintenance: "warning",
    Operational: "success",
    operational: "success",
    standby: "secondary",
  } as const;

  return statusColors[status as keyof typeof statusColors] || "default";
};

const getUtilizationColor = (rate: number | null) => {
  if (rate === null) return "success";
  if (rate > 90) return "danger";
  if (rate > 70) return "warning";

  return "success";
};

export default function TableDatas({
  dataTable,
  users,
}: ManagementClientProps) {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onOpenChange: onDetailOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onOpenChange: onImportOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMaintenanceOpen,
    onOpen: onMaintenanceOpen,
    onOpenChange: onMaintenanceOpenChange,
  } = useDisclosure();
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Unit | null>(null);

  // Use deferred value untuk mengurangi re-render saat typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Memoize users lookup untuk performa
  const usersMap = useMemo(() => {
    return new Map(
      users.map((user) => [user.id, { name: user.name, photo: user.photo }]),
    );
  }, [users]);

  const getUserName = useCallback(
    (userId: string | null): string => {
      if (!userId) return "Unassigned";

      return usersMap.get(userId)?.name || userId;
    },
    [usersMap],
  );

  const getUserPhoto = useCallback(
    (userId: string | null): string | undefined => {
      if (!userId) return undefined;
      const photo = usersMap.get(userId)?.photo;

      if (!photo) return undefined;
      // Jika sudah ada /uploads/ di depannya, return apa adanya
      if (photo.startsWith("/uploads/")) return photo;

      // Jika hanya nama file, tambahkan prefix
      return `/uploads/${photo}`;
    },
    [usersMap],
  );

  // Optimized search dengan useCallback
  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchQuery(value);
      setPage(1);
    });
  }, []);

  // Filter data berdasarkan deferred search query
  const filteredData = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return dataTable;
    }

    const query = deferredSearchQuery.toLowerCase();

    return dataTable.filter((asset) => {
      // Check basic fields
      const basicFieldsMatch = SEARCH_FIELDS.some((field) => {
        const value = asset[field];

        return value?.toString().toLowerCase().includes(query);
      });

      if (basicFieldsMatch) return true;

      // Check derived fields
      return (
        getCategoryName(asset.categoryId).toLowerCase().includes(query) ||
        getUserName(asset.assignedToId).toLowerCase().includes(query)
      );
    });
  }, [dataTable, deferredSearchQuery, getUserName]);

  // Pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    const start = (page - 1) * ROWS_PER_PAGE;
    const items = filteredData.slice(start, start + ROWS_PER_PAGE);

    return { totalPages, items };
  }, [filteredData, page]);

  // Callback untuk modal close
  const handleUserAdded = useCallback(() => {
    router.refresh();
    onOpenChange();
  }, [router, onOpenChange]);

  // Callback untuk pagination
  const handlePageChange = useCallback((newPage: number) => {
    startTransition(() => {
      setPage(newPage);
    });
  }, []);

  // Handler untuk membuka modal detail asset
  const handleViewAsset = useCallback(
    (asset: Unit) => {
      setSelectedAsset(asset);
      onDetailOpen();
    },
    [onDetailOpen],
  );

  // Handler untuk membuka modal edit asset
  const handleEditAsset = useCallback(
    (asset: Unit) => {
      setSelectedAsset(asset);
      onEditOpen();
    },
    [onEditOpen],
  );

  // Callback untuk asset updated
  const handleAssetUpdated = useCallback(() => {
    router.refresh();
    onEditOpenChange();
  }, [router, onEditOpenChange]);

  // Callback untuk import complete
  const handleAssetsImported = useCallback(() => {
    router.refresh();
    onImportOpenChange();
  }, [router, onImportOpenChange]);

  // Handler untuk membuka modal delete asset
  const handleDeleteAsset = useCallback(
    (asset: Unit) => {
      setSelectedAsset(asset);
      onDeleteOpen();
    },
    [onDeleteOpen],
  );

  // Callback untuk asset deleted
  const handleAssetDeleted = useCallback(() => {
    router.refresh();
    onDeleteOpenChange();
  }, [router, onDeleteOpenChange]);

  // Handler untuk membuka modal maintenance log
  const handleMaintenanceLog = useCallback(
    (asset: Unit) => {
      setSelectedAsset(asset);
      onMaintenanceOpen();
    },
    [onMaintenanceOpen],
  );

  // Callback untuk maintenance logged
  const handleMaintenanceLogged = useCallback(() => {
    router.refresh();
    onMaintenanceOpenChange();
  }, [router, onMaintenanceOpenChange]);

  // Fungsi untuk export data ke Excel
  const handleExportToExcel = useCallback(() => {
    // Buat map untuk users lookup
    const usersMap = new Map(users.map((user) => [user.id, user.name]));

    // Siapkan data untuk export
    const exportData = filteredData.map((asset) => ({
      "Asset Tag": asset.assetTag,
      "Nama Asset": asset.name,
      Deskripsi: asset.description || "",
      Kategori: getCategoryName(asset.categoryId),
      Status: asset.status,
      Kondisi: asset.condition || "",
      "Nomor Seri": asset.serialNumber || "",
      Lokasi: asset.location,
      Departemen: asset.department || "",
      Pabrikan: asset.manufacturer || "",
      "Tanggal Instalasi": asset.installDate
        ? new Date(asset.installDate).toLocaleDateString("id-ID")
        : "",
      "Tanggal Garansi Berakhir": asset.warrantyExpiry
        ? new Date(asset.warrantyExpiry).toLocaleDateString("id-ID")
        : "",
      "Maintenance Terakhir": asset.lastMaintenance
        ? new Date(asset.lastMaintenance).toLocaleDateString("id-ID")
        : "",
      "Maintenance Berikutnya": asset.nextMaintenance
        ? new Date(asset.nextMaintenance).toLocaleDateString("id-ID")
        : "",
      "Nilai Asset": asset.assetValue
        ? asset.assetValue.toLocaleString("id-ID")
        : "",
      "Tingkat Pemanfaatan (%)": asset.utilizationRate || "",
      "Ditugaskan Kepada": asset.assignedToId
        ? usersMap.get(asset.assignedToId) || "Unknown"
        : "Unassigned",
      "Tanggal Dibuat": new Date(asset.createdAt).toLocaleDateString("id-ID"),
    }));

    // Buat worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set lebar kolom
    const columnWidths = [
      { wch: 12 }, // Asset Tag
      { wch: 25 }, // Nama Asset
      { wch: 30 }, // Deskripsi
      { wch: 15 }, // Kategori
      { wch: 12 }, // Status
      { wch: 12 }, // Kondisi
      { wch: 15 }, // Nomor Seri
      { wch: 20 }, // Lokasi
      { wch: 15 }, // Departemen
      { wch: 15 }, // Pabrikan
      { wch: 15 }, // Tanggal Instalasi
      { wch: 15 }, // Tanggal Garansi Berakhir
      { wch: 15 }, // Maintenance Terakhir
      { wch: 15 }, // Maintenance Berikutnya
      { wch: 15 }, // Nilai Asset
      { wch: 15 }, // Tingkat Pemanfaatan
      { wch: 20 }, // Ditugaskan Kepada
      { wch: 15 }, // Tanggal Dibuat
    ];

    ws["!cols"] = columnWidths;

    // Buat workbook
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Asset Inventory");

    // Generate nama file dengan timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const fileName = `asset_inventory_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
  }, [filteredData, users]);

  // Memoize action handlers
  const renderActionCell = useCallback(
    (asset: Unit) => (
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
              onPress={() => handleViewAsset(asset)}
            >
              View Details
            </DropdownItem>
            {session?.user?.role === "super_admin" ? (
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => handleEditAsset(asset)}
              >
                Edit Asset
              </DropdownItem>
            ) : null}
            <DropdownItem
              key="maintenance"
              startContent={<Wrench className="w-4 h-4" />}
              onPress={() => handleMaintenanceLog(asset)}
            >
              Log Maintenance
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={() => handleDeleteAsset(asset)}
            >
              Delete Asset
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        {/* <Button isIconOnly size="sm" variant="flat">
          <Activity className="w-4 h-4" />
        </Button> */}
      </div>
    ),
    [handleViewAsset, handleEditAsset, handleMaintenanceLog, handleDeleteAsset],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-default-800 text-left">
                  Asset Inventory
                </p>
                <Chip
                  className="text-sm font-bold"
                  color="success"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  {filteredData.length}
                </Chip>
              </div>
              <p className="text-small text-default-600">
                Asset management system
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              className="hidden sm:flex w-64"
              placeholder="Search assets..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onValueChange={handleSearchChange}
            />
            <Button
              className="flex-1 sm:flex-none"
              color="success"
              size="sm"
              startContent={<Upload className="w-4 h-4" />}
              variant="flat"
              onPress={handleExportToExcel}
            >
              Export
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              color="warning"
              size="sm"
              startContent={<Download className="w-4 h-4" />}
              variant="flat"
              onPress={onImportOpen}
            >
              Import
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              color="primary"
              size="sm"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <Divider />

        <CardBody className="px-0">
          {/* Search input untuk mobile */}
          <div className="px-6 pb-4 sm:hidden">
            <Input
              placeholder="Search assets..."
              size="sm"
              startContent={<Search className="w-4 h-4 text-default-400" />}
              value={searchQuery}
              variant="flat"
              onValueChange={handleSearchChange}
            />
          </div>

          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-default-300 mb-4" />
              <p className="text-default-500">
                {deferredSearchQuery
                  ? "No assets found matching your search"
                  : "No assets available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                aria-label="Asset inventory table"
                bottomContent={
                  paginationData.totalPages > 1 && (
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={paginationData.totalPages}
                        onChange={handlePageChange}
                      />
                    </div>
                  )
                }
              >
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
                  {paginationData.items.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {asset.assetTag}
                            </span>
                            <span className="text-xs">
                              {getCategoryIcon(asset.categoryId)}
                            </span>
                          </div>
                          <p className="text-xs text-default-600 line-clamp-1">
                            {asset.name}
                          </p>
                          {asset.serialNumber && (
                            <p className="text-xs text-default-500">
                              S/N: {asset.serialNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <User
                          avatarProps={{
                            // radius: "lg",
                            size: "sm",
                            src: getUserPhoto(asset.assignedToId),
                            className:
                              "w-8 h-8 rounded-full object-cover flex-shrink-0",
                          }}
                          classNames={{
                            name: "text-sm font-medium",
                            description: "text-xs text-default-500",
                            wrapper: "truncate",
                          }}
                          description={asset.department || "No department"}
                          name={getUserName(asset.assignedToId)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color="default"
                          size="sm"
                          variant="flat"
                        >
                          {getCategoryName(asset.categoryId)}
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
                          <span className="text-sm truncate">
                            {asset.location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {asset.condition && (
                            <Chip color="success" size="sm" variant="flat">
                              {asset.condition}
                            </Chip>
                          )}
                          <Progress
                            aria-label="Utilization rate"
                            className="max-w-16"
                            color={getUtilizationColor(asset.utilizationRate)}
                            size="sm"
                            value={asset.utilizationRate || 0}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{renderActionCell(asset)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal Add Asset */}
      <div className="mx-4">
        <Modal
          isOpen={isOpen}
          placement="top-center"
          size="2xl"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <AddForms
                users={users}
                onClose={onClose}
                onUnitAdded={handleUserAdded}
              />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Detail Asset */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={isDetailOpen}
        users={users}
        onClose={onDetailOpenChange}
      />

      {/* Modal Edit Asset */}
      <div className="mx-4">
        <Modal
          isOpen={isEditOpen}
          placement="top-center"
          size="2xl"
          onOpenChange={onEditOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <EditAssetModal
                asset={selectedAsset}
                userRole={session?.user?.role || ""}
                users={users}
                onAssetUpdated={handleAssetUpdated}
                onClose={onClose}
              />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Import Asset */}
      <div className="mx-4">
        <Modal
          isOpen={isImportOpen}
          placement="top-center"
          size="4xl"
          onOpenChange={onImportOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <ImportAssetModal
                users={users}
                onAssetsImported={handleAssetsImported}
                onClose={onClose}
              />
            )}
          </ModalContent>
        </Modal>
      </div>

      {/* Modal Delete Asset */}
      <DeleteAssetModal
        asset={selectedAsset}
        isOpen={isDeleteOpen}
        onAssetDeleted={handleAssetDeleted}
        onClose={onDeleteOpenChange}
      />

      {/* Modal Maintenance Log */}
      <MaintenanceLogModal
        asset={selectedAsset}
        isOpen={isMaintenanceOpen}
        users={users}
        onClose={onMaintenanceOpenChange}
        onMaintenanceLogged={handleMaintenanceLogged}
      />
    </>
  );
}
