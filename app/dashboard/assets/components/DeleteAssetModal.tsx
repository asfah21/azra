"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";
import { Trash2, AlertTriangle, Package } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAsset } from "../action";

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

interface DeleteAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Unit | null;
  onAssetDeleted?: () => void;
}

export function DeleteAssetModal({
  isOpen,
  onClose,
  asset,
  onAssetDeleted,
}: DeleteAssetModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // React Query mutation untuk delete asset
  const mutation = useMutation({
    mutationFn: async () => {
      if (!asset) return { success: false, message: "Asset not found!" };
      if (session?.user?.role !== "super_admin") {
        return {
          success: false,
          message:
            "Unauthorized: Only Super Admin can delete assets.",
        };
      }

      return await deleteAsset(asset.id, session.user.role);
    },
    onSuccess: (data) => {
      // Invalidate cache assets agar data ter-refresh
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        setTimeout(() => {
          onClose();
          if (onAssetDeleted) onAssetDeleted();
        }, 1500);
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      // setResult(null); // Removed as per new_code
      // setIsDeleting(false); // Removed as per new_code
    }
  }, [isOpen]);

  // Ganti handleDelete jadi trigger mutation
  const handleDelete = () => {
    mutation.mutate();
  };

  const getCategoryName = (category: number): string => {
    const categories = {
      1: "Alat Berat",
      2: "Elektronik",
    } as const;

    return categories[category as keyof typeof categories] || "Lainnya";
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

  if (!asset) return null;

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-danger-600" />
                </div>
                <span className="text-lg font-semibold">
                  Delete Asset Confirmation
                </span>
              </div>
            </ModalHeader>

            <ModalBody>
              {mutation.data ? (
                <div
                  className={`p-4 rounded-lg ${
                    mutation.data.success
                      ? "bg-success-50 border border-success-200"
                      : "bg-danger-50 border border-danger-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg ${
                        mutation.data.success
                          ? "text-success-600"
                          : "text-danger-600"
                      }`}
                    >
                      {mutation.data.success ? "✅" : "❌"}
                    </span>
                    <span
                      className={`font-medium ${
                        mutation.data.success
                          ? "text-success-800"
                          : "text-danger-800"
                      }`}
                    >
                      {mutation.data.message}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {session?.user?.role !== "super_admin" && (
                    <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                        <span className="font-medium text-danger-800">
                          Access Denied
                        </span>
                      </div>
                      <p className="text-danger-700 text-sm">
                        Only Super Admin can delete assets.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-warning-600" />
                      <span className="font-medium text-warning-800">
                        Warning
                      </span>
                    </div>
                    <p className="text-warning-700 text-sm">
                      Asset that is deleted cannot be restored.
                    </p>
                  </div>

                  <div className="p-4 border border-default-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-default-100 rounded-lg">
                        <Package className="w-6 h-6 text-default-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-default-800">
                          {asset.name}
                        </h3>
                        <p className="text-sm text-default-600">
                          {asset.assetTag}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Category:
                        </span>
                        <Chip color="default" size="sm" variant="flat">
                          {getCategoryName(asset.categoryId)}
                        </Chip>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Status:
                        </span>
                        <Chip
                          color={getStatusColor(asset.status) as any}
                          size="sm"
                          variant="dot"
                        >
                          {asset.status}
                        </Chip>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Location:
                        </span>
                        <span className="text-sm text-default-700">
                          {asset.location}
                        </span>
                      </div>

                      {asset.department && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-default-600">
                            Department:
                          </span>
                          <span className="text-sm text-default-700">
                            {asset.department}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Created:
                        </span>
                        <span className="text-sm text-default-700">
                          {new Date(asset.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* <div className="text-center">
                    <p className="text-default-600">
                      Apakah Anda yakin ingin menghapus asset{" "}
                      <strong>{asset.name}</strong> ({asset.assetTag})?
                    </p>
                  </div> */}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {!mutation.data && (
                <>
                  <Button
                    color="default"
                    isDisabled={mutation.isPending}
                    variant="light"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isDisabled={session?.user?.role !== "super_admin"}
                    isLoading={mutation.isPending}
                    startContent={
                      !mutation.isPending ? (
                        <Trash2 className="w-4 h-4" />
                      ) : undefined
                    }
                    onPress={handleDelete}
                  >
                    {mutation.isPending ? "Deleting..." : "Delete Asset"}
                  </Button>
                </>
              )}
              {mutation.data && (
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
