"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Chip,
  Avatar,
} from "@heroui/react";
import {
  MapPin,
  Package,
  Activity,
  DollarSign,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Unit | null;
  users: Array<{ id: string; name: string }>;
}

export default function AssetDetailModal({
  isOpen,
  onClose,
  asset,
  users,
}: AssetDetailModalProps) {
  if (!asset) return null;

  // Helper functions
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
      2: "",
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

  const getUserName = (userId: string | null): string => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.id === userId);

    return user?.name || userId;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "Not set";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getWarrantyStatus = (warrantyExpiry: Date | null) => {
    if (!warrantyExpiry)
      return {
        status: "No warranty",
        color: "default",
        icon: <XCircle className="w-4 h-4" />,
      };

    const now = new Date();
    const diffInDays = Math.floor(
      (warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays < 0)
      return {
        status: "Expired",
        color: "danger",
        icon: <XCircle className="w-4 h-4" />,
      };
    if (diffInDays < 30)
      return {
        status: "Expiring soon",
        color: "warning",
        icon: <AlertTriangle className="w-4 h-4" />,
      };

    return {
      status: "Active",
      color: "success",
      icon: <CheckCircle className="w-4 h-4" />,
    };
  };

  const warrantyStatus = getWarrantyStatus(asset.warrantyExpiry);

  return (
    <Modal isOpen={isOpen} placement="top-center" size="2xl" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Avatar
                  className="bg-primary text-white"
                  name={asset.name}
                  size="lg"
                >
                  <span className="text-lg">
                    {getCategoryIcon(asset.categoryId)}
                  </span>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{asset.name}</h2>
                  <p className="text-sm text-default-500">
                    Asset Tag: {asset.assetTag}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Status dan Category */}
                <div className="flex flex-wrap gap-3">
                  <Chip
                    color={getStatusColor(asset.status) as any}
                    size="lg"
                    startContent={<Activity className="w-4 h-4" />}
                    variant="dot"
                  >
                    {asset.status}
                  </Chip>
                  <Chip
                    color="default"
                    size="lg"
                    startContent={<Package className="w-4 h-4" />}
                    variant="flat"
                  >
                    {getCategoryName(asset.categoryId)}
                  </Chip>
                  {asset.condition && (
                    <Chip
                      color="success"
                      size="lg"
                      startContent={<CheckCircle className="w-4 h-4" />}
                      variant="flat"
                    >
                      {asset.condition}
                    </Chip>
                  )}
                </div>

                <Divider />

                {/* Informasi Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Asset Information</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Asset ID:</span>{" "}
                          {asset.assetTag}
                        </p>
                        {asset.serialNumber && (
                          <p>
                            <span className="font-medium">SN:</span>{" "}
                            {asset.serialNumber}
                          </p>
                        )}
                        {/* {asset.description && (
                          <p><span className="font-medium">Description:</span> {asset.description}</p>
                        )} */}
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <h3 className="font-semibold">Location & Assignment</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {asset.location}
                        </p>
                        <p>
                          <span className="font-medium">Department:</span>{" "}
                          {asset.department || "Not assigned"}
                        </p>
                        {/* <p><span className="font-medium">Assigned To:</span> {getUserName(asset.assignedToId)}</p> */}
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Settings className="w-5 h-5 text-success" />
                        <h3 className="font-semibold">Manufacturer</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Manufacturer:</span>{" "}
                          {asset.manufacturer || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Install Date:</span>{" "}
                          {formatDate(asset.installDate)}
                        </p>
                        {/* <p><span className="font-medium">Asset Value:</span> {formatCurrency(asset.assetValue)}</p> */}
                      </div>
                    </CardBody>
                  </Card>

                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-warning" />
                        <h3 className="font-semibold">Warranty Status</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {warrantyStatus.icon}
                          <Chip
                            color={warrantyStatus.color as any}
                            size="sm"
                            variant="flat"
                          >
                            {warrantyStatus.status}
                          </Chip>
                        </div>
                        <p>
                          <span className="font-medium">Expiry Date:</span>{" "}
                          {formatDate(asset.warrantyExpiry)}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* <Divider /> */}

                {/* Utilization Rate */}
                {/* <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Utilization Rate
                  </h3>
                  <Card className="bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Current Utilization</span>
                        <span className="text-sm font-bold">
                          {asset.utilizationRate || 0}%
                        </span>
                      </div>
                      <Progress
                        aria-label="Utilization rate"
                        color={getUtilizationColor(asset.utilizationRate)}
                        size="lg"
                        value={asset.utilizationRate || 0}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-default-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </CardBody>
                  </Card>
                </div> */}

                <Divider />

                {/* Asset Statistics */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Asset Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-success-50 border-success-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-success">
                          {asset.utilizationRate || 0}%
                        </p>
                        <p className="text-xs text-success-600">Utilization</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-primary-50 border-primary-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {asset.assetValue
                            ? Math.round(asset.assetValue / 1000000)
                            : 0}
                          M
                        </p>
                        <p className="text-xs text-primary-600">Value (IDR)</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-warning-50 border-warning-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-warning">
                          {asset.lastMaintenance ? "✓" : "✗"}
                        </p>
                        <p className="text-xs text-warning-600">Maintained</p>
                      </CardBody>
                    </Card>
                    <Card className="bg-secondary-50 border-secondary-200">
                      <CardBody className="p-3 text-center">
                        <p className="text-2xl font-bold text-secondary">
                          {asset.warrantyExpiry ? "✓" : "✗"}
                        </p>
                        <p className="text-xs text-secondary-600">Warranty</p>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {/* <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button> */}
              <Button color="danger" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
