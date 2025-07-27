"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // React Query mutation untuk update user
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateUser(null, formData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      setTimeout(() => {
        onClose();
        if (onUserUpdated) onUserUpdated();
      }, 500);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      const formData = new FormData(e.currentTarget);
      formData.append("id", user.id);
      if (session?.user?.role) {
        formData.append("currentUserRole", session.user.role);
      }
      mutation.mutate(formData);
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
        <form onSubmit={handleSubmit} className="space-y-4" id="editUserForm">
          <Input
            isRequired
            defaultValue={user.name}
            label="Name"
            name="name"
            placeholder="Enter user name"
            variant="bordered"
          />
          <Input
            isRequired
            defaultValue={user.email}
            label="Email"
            name="email"
            placeholder="Enter email address"
            type="email"
            variant="bordered"
          />
          <Input
            label="New Password (leave empty to keep current)"
            name="password"
            placeholder="Enter new password (optional)"
            type="password"
            variant="bordered"
          />
          <Select
            isRequired
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
            defaultValue={user.department || ""}
            label="Department"
            name="department"
            placeholder="Enter department (optional)"
            variant="bordered"
          />

          {/* Success Message */}
          {mutation.data && mutation.data.message && !mutation.data.errors && (
            <Card className="border-success-200 bg-success-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <p className="text-success-700 text-sm font-medium">
                    {mutation.data.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Messages */}
          {mutation.data && mutation.data.message && mutation.data.errors && (
            <Card className="border-danger-200 bg-danger-50">
              <CardBody className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger-500 rounded-full" />
                  <p className="text-danger-700 text-sm font-medium">
                    {mutation.data.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </form>
      </ModalBody>

      <ModalFooter>
        <Button
          className="font-medium"
          color="danger"
          isDisabled={mutation.isPending}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="editUserForm"
          isDisabled={mutation.isPending}
          isLoading={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? "Updating..." : "Update User"}
        </Button>
      </ModalFooter>
    </>
  );
}
