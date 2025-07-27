"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  User,
  Chip,
} from "@heroui/react";
import { Trash2, AlertTriangle } from "lucide-react";

import { deleteUser } from "../action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserDeleted?: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  user,
  onUserDeleted,
}: DeleteConfirmModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Gunakan mutation seperti DeleteAssetModal
  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) return { success: false, message: "User tidak ditemukan!" };
      if (session?.user?.role !== "super_admin") {
        return { success: false, message: "Unauthorized: Hanya Super Admin yang dapat menghapus user." };
      }
      // Pastikan deleteUser mengembalikan { success, message }
      return await deleteUser(user.id, session.user.role);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["users-data"] });
        setTimeout(() => {
          onClose();
          if (onUserDeleted) onUserDeleted();
        }, 1500);
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Tidak perlu reset manual, mutation akan handle
    }
  }, [isOpen]);

  const handleDelete = () => {
    mutation.mutate();
  };

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin_elec":
        return "danger";
      case "admin_heavy":
        return "warning";
      case "pengawas":
        return "secondary";
      case "mekanik":
        return "primary";
      case "super_admin":
        return "success";
      default:
        return "default";
    }
  };

  if (!user) return null;

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
                  Konfirmasi Hapus User
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
                        mutation.data.success ? "text-success-600" : "text-danger-600"
                      }`}
                    >
                      {mutation.data.success ? "✅" : "❌"}
                    </span>
                    <span
                      className={`font-medium ${
                        mutation.data.success ? "text-success-800" : "text-danger-800"
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
                          Akses Ditolak
                        </span>
                      </div>
                      <p className="text-danger-700 text-sm">
                        Hanya Super Admin yang dapat menghapus user.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-warning-600" />
                      <span className="font-medium text-warning-800">
                        Peringatan
                      </span>
                    </div>
                    <p className="text-warning-700 text-sm">
                      User yang dihapus tidak dapat dipulihkan.
                    </p>
                  </div>

                  <div className="p-4 border border-default-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <User
                        avatarProps={{
                          radius: "lg",
                          size: "md",
                        }}
                        classNames={{
                          description: "text-default-500",
                        }}
                        description={user.email}
                        name={user.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Role:
                        </span>
                        <Chip
                          color={getRoleColor(user.role) as any}
                          size="sm"
                          variant="flat"
                        >
                          {getRoleLabel(user.role)}
                        </Chip>
                      </div>

                      {user.department && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-default-600">
                            Department:
                          </span>
                          <span className="text-sm text-default-700">
                            {user.department}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-default-600">
                          Bergabung:
                        </span>
                        <span className="text-sm text-default-700">
                          {new Date(user.createdAt).toLocaleDateString(
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
                    Batal
                  </Button>
                  <Button
                    color="danger"
                    isDisabled={session?.user?.role !== "super_admin"}
                    isLoading={mutation.isPending}
                    startContent={
                      !mutation.isPending ? <Trash2 className="w-4 h-4" /> : undefined
                    }
                    onPress={handleDelete}
                  >
                    {mutation.isPending ? "Menghapus..." : "Hapus User"}
                  </Button>
                </>
              )}
              {mutation.data && (
                <Button color="primary" onPress={onClose}>
                  Tutup
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
