"use client";

import { Modal, ModalContent, Progress, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
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
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Wrench,
  Activity,
  Package,
} from "lucide-react";

import { UserName } from "./UserName";
import { AddForms } from "./AddForm";

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
}

export default function TableDatas({ dataTable }: ManagementClientProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
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

  const getCategoryIcon = (category: number) => {
    switch (category) {
      case 1:
        return "🚜";
      case 2:
        return "💻";
      default:
        return "📦";
    }
  };

  const getCategoryName = (category: number) => {
    switch (category) {
      case 1:
        return "Alat Berat";
      case 2:
        return "Elektronik";
      default:
        return "Lainnya";
    }
  };

  // Label yang akan ditampilkan
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "pengawas":
        return "Foreman";
      case "mekanik":
        return "Mekanik";
      case "admin_heavy":
        return "Admin PAM";
      case "admin_elec":
        return "Admin";
      default:
        return role;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <p className="text-xl font-semibold text-default-800 text-left">
                Asset Inventory
              </p>
              <p className="text-small text-default-600 text-left">
                Asset management system
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
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
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onOpen}
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
                {dataTable.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
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
                        <p className="text-xs text-default-500">
                          S/N: {asset.serialNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <User
                        avatarProps={{
                          radius: "lg",
                          // src: asset.assignedAvatar,
                          size: "sm",
                        }}
                        classNames={{
                          name: "text-sm font-medium",
                          description: "text-xs text-default-500",
                        }}
                        description={asset.department}
                        name={<UserName userId={asset.assignedToId} />}
                        // name=<UserName userId={asset.assignedToId} />
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
                        // color="danger"
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
                          // color={getConditionColor(asset.condition) as any}
                          color="success"
                          size="sm"
                          variant="flat"
                        >
                          {asset.condition}
                        </Chip>
                        <Progress
                          aria-label="Utilization rate"
                          className="max-w-16"
                          color={
                            asset.utilizationRate === null
                              ? "success"
                              : asset.utilizationRate > 90
                                ? "danger"
                                : asset.utilizationRate > 70
                                  ? "warning"
                                  : "success"
                          }
                          size="sm"
                          value={asset.utilizationRate as number}
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
              <AddForms onClose={onClose} onUnitAdded={handleUserAdded} />
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
