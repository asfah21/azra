// Issue page ini:

// 1.Jangan Percayai session.user.role di Client
// 2.Hindari useEffect(() => { ... }, []) yang tidak perlu
// 3.Optional: Hindari as any pada color


"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  User,
  Chip,
} from "@heroui/react";
import { Trash2, AlertTriangle } from "lucide-react";

import { deleteUser } from "../action";

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
  onClose: () => void;
  user: User | null;
  onUserDeleted?: () => void;
}

export function DeleteConfirmModal({
  onClose,
  user,
  onUserDeleted,
}: DeleteConfirmModalProps) {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setResult(null);
    setIsDeleting(false);
  }, []);

  const handleDelete = async () => {
    if (!user) return;

    if (session?.user?.role !== "super_admin") {
      setResult({
        success: false,
        message: "Unauthorized: Hanya Super Admin yang dapat menghapus user.",
      });

      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const response = await deleteUser(user.id, session.user.role);

      setResult(response);

      if (response.success) {
        setTimeout(() => {
          onClose();
          if (onUserDeleted) {
            onUserDeleted();
          }
        }, 1500);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Terjadi kesalahan saat menghapus user.",
      });
    } finally {
      setIsDeleting(false);
    }
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
    <>
      <ModalHeader className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-danger-100 rounded-lg">
            <Trash2 className="w-5 h-5 text-danger-600" />
          </div>
          <span className="text-lg font-semibold">Konfirmasi Hapus User</span>
        </div>
      </ModalHeader>

      <ModalBody>
        {result ? (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? "bg-success-50 border border-success-200"
                : "bg-danger-50 border border-danger-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-lg ${
                  result.success ? "text-success-600" : "text-danger-600"
                }`}
              >
                {result.success ? "✅" : "❌"}
              </span>
              <span
                className={`font-medium ${
                  result.success ? "text-success-800" : "text-danger-800"
                }`}
              >
                {result.message}
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
                  Anda tidak memiliki izin untuk menghapus user. Hanya Super
                  Admin yang dapat melakukan tindakan ini.
                </p>
              </div>
            )}

            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                <span className="font-medium text-warning-800">Peringatan</span>
              </div>
              <p className="text-warning-700 text-sm">
                Tindakan ini tidak dapat dibatalkan. User yang dihapus tidak
                dapat dipulihkan.
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
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-default-600">
                Apakah Anda yakin ingin menghapus user{" "}
                <strong>{user.name}</strong>?
              </p>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {!result && (
          <>
            <Button
              color="default"
              isDisabled={isDeleting}
              variant="light"
              onPress={onClose}
            >
              Batal
            </Button>
            <Button
              color="danger"
              isDisabled={session?.user?.role !== "super_admin"}
              isLoading={isDeleting}
              startContent={
                !isDeleting ? <Trash2 className="w-4 h-4" /> : undefined
              }
              onPress={handleDelete}
            >
              {isDeleting ? "Menghapus..." : "Hapus User"}
            </Button>
          </>
        )}
        {result && (
          <Button color="primary" onPress={onClose}>
            Tutup
          </Button>
        )}
      </ModalFooter>
    </>
  );
}
