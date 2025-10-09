"use client";

import { useActionState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Input,
  Autocomplete,
  AutocompleteItem,
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
  isOpen = true,
}: EditUserModalProps & { isOpen?: boolean }) {
  const { data: session } = useSession();
  const [state, formAction, isPending] = useActionState(updateUser, null);

  // Static role options untuk menghindari masalah hooks
  const staticRoleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin_heavy", label: "Admin Heavy" },
    { value: "admin_elec", label: "Admin Electrical" },
    { value: "pengawas", label: "Pengawas" },
    { value: "mekanik", label: "Mekanik" },
    { value: "guest", label: "Guest" },
  ];

  // Auto close modal jika berhasil update user
  useEffect(() => {
    if (state?.message && !state?.errors) {
      const timer = setTimeout(() => {
        onClose();
        if (onUserUpdated) {
          onUserUpdated();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state?.message, state?.errors, onClose, onUserUpdated]);

  // Find matching role option for current user role - memoized untuk consistency
  const currentRoleKey = useMemo(() => {
    if (!user?.role || !staticRoleOptions.length) return "";

    // Find by value
    const byValue = staticRoleOptions.find(
      (option) => option.value === user.role,
    );

    if (byValue) return byValue.value;

    // Last fallback: return as is
    return user.role;
  }, [user?.role, staticRoleOptions]);

  const handleSubmit = async (formData: FormData) => {
    if (user) {
      formData.append("id", user.id);
      if (session?.user?.role) {
        formData.append("currentUserRole", session.user.role);
      }

      // Debug logging
      console.log("FormData being sent:", {
        id: formData.get("id"),
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role"),
        department: formData.get("department"),
        currentUserRole: formData.get("currentUserRole"),
        hasPassword: !!formData.get("password"),
      });

      await formAction(formData);
    }
  };

  // Always render modal content, but disable form fields if no user
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
            defaultValue={user?.name || ""}
            isDisabled={!user}
            label="Name"
            labelPlacement="outside-top"
            name="name"
            placeholder="Enter user name"
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />
          <Input
            isRequired
            defaultValue={user?.email || ""}
            isDisabled={!user}
            label="Email"
            labelPlacement="outside-top"
            name="email"
            placeholder="Enter email address"
            type="email"
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />
          <Input
            isDisabled={!user}
            label="New Password (empty to keep current)"
            labelPlacement="outside-top"
            name="password"
            placeholder="Enter new password (optional)"
            type="password"
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          <Autocomplete
            defaultItems={staticRoleOptions}
            defaultSelectedKey={user ? currentRoleKey : ""}
            isDisabled={!user}
            label="User Roles"
            labelPlacement="outside-top"
            name="role"
            placeholder="Search user roles"
            selectedKey={user ? currentRoleKey : ""}
            style={{ outline: "none" }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
            // force value to be the enum value, not label
            variant="bordered"
          >
            {(item) => (
              <AutocompleteItem key={item.value} variant="flat">
                {item.value}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <Input
            defaultValue={user?.department || ""}
            isDisabled={!user}
            label="Department"
            labelPlacement="outside-top"
            name="department"
            placeholder="Enter department (optional)"
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          {/* Success Message */}
          {state?.message && !state?.errors && (
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
          {(state?.errors?.general || state?.errors?.email) && (
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
          isDisabled={isPending || !user}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="editUserForm"
          isDisabled={isPending || !user}
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Updating..." : "Update User"}
        </Button>
      </ModalFooter>
    </>
  );
}
