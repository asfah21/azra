// Issue di page ini :
// 1. Keamanan - Perlu validasi ulang role/id di server pakai zod
// 2. Validasi - Perlu pastikan password kosong = tidak update

"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  SelectItem,
  Select,
  Input,
} from "@heroui/react";

import { updateUser } from "../action";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
  lastActive: Date | null;
}

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export function EditUserModal({
  user,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const { data: session } = useSession();
  const [state, formAction, isPending] = useActionState(updateUser, null);

  // Auto close modal jika berhasil update user
  useEffect(() => {
    // Hanya close modal jika ada message sukses dan tidak ada errors
    if (state && state.message && !state.errors) {
      // Tunggu 500ms agar user bisa lihat pesan sukses
      const timer = setTimeout(() => {
        onClose();
        // Trigger refresh data jika callback tersedia
        if (onUserUpdated) {
          onUserUpdated();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state, onClose, onUserUpdated]);

  const handleSubmit = async (formData: FormData) => {
    if (user) {
      formData.append("id", user.id);
      // Tambahkan currentUserRole dari session
      if (session?.user?.role) {
        formData.append("currentUserRole", session.user.role);
      }
      await formAction(formData);
    }
  };

  if (!user) return null;

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Edit User</h2>
        <p className="text-sm text-default-500">Update user information</p>
      </ModalHeader>

      <ModalBody>
        <form action={handleSubmit} className="space-y-4" id="editUserForm">
          <Input
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={user.name}
            label="Name"
            name="name"
            placeholder="Enter user name"
            variant="bordered"
          />

          <Input
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={user.email}
            label="Email"
            name="email"
            placeholder="Enter email address"
            type="email"
            variant="bordered"
          />

          <Input
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            label="New Password (leave empty to keep current)"
            name="password"
            placeholder="Enter new password (optional)"
            type="password"
            variant="bordered"
          />

          <Select
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              trigger: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
              ],
              value: "text-black/90 dark:text-white/90",
            }}
            defaultSelectedKeys={[user.role]}
            label="Role"
            name="role"
            placeholder="Select user role"
            variant="bordered"
          >
            <SelectItem key="super_admin">Super Admin</SelectItem>
            <SelectItem key="admin_heavy">Admin Heavy</SelectItem>
            <SelectItem key="admin_elec">Admin Electrical</SelectItem>
            <SelectItem key="pengawas">Pengawas</SelectItem>
            <SelectItem key="mekanik">Mekanik</SelectItem>
          </Select>

          <Input
            classNames={{
              label: "text-black/50 dark:text-white/90",
              input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
              ],
              innerWrapper: "bg-transparent",
              inputWrapper: [
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focused=true]:bg-default-200/50",
                "dark:group-data-[focused=true]:bg-default/60",
                "!cursor-text",
              ],
            }}
            defaultValue={user.department || ""}
            label="Department"
            name="department"
            placeholder="Enter department (optional)"
            variant="bordered"
          />

          {/* Success Message */}
          {state && state.message && !state.errors && (
            <Card className="border-success-200 bg-success-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <p className="text-success-700 text-sm font-medium">
                    {state.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Messages */}
          {state &&
            state.errors &&
            (state.errors.general || state.errors.email) && (
              <Card className="border-danger-200 bg-danger-50">
                <CardBody className="py-3">
                  {state.errors.general && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-danger-500 rounded-full" />
                      <p className="text-danger-700 text-sm font-medium">
                        {state.errors.general}
                      </p>
                    </div>
                  )}
                  {state.errors.email && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-danger-500 rounded-full" />
                      <p className="text-danger-700 text-sm font-medium">
                        {state.errors.email}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
        </form>
      </ModalBody>

      <ModalFooter>
        <Button
          className="font-medium"
          color="danger"
          isDisabled={isPending}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="editUserForm"
          isDisabled={isPending}
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Updating..." : "Update User"}
        </Button>
      </ModalFooter>
    </>
  );
}
