"use client";

import { useActionState, useEffect } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { addUsers } from "../action";

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

export function AddUserForms({ onClose, onUserAdded }: AddUserFormProps) {
  const [state, formAction, isPending] = useActionState(addUsers, null);
  const queryClient = useQueryClient();

  const addUserMutation = useMutation({
    mutationFn: async (newUser) => {
      // Panggil server action/API untuk tambah user
      return await axios.post("/api/dashboard/users", newUser);
    },
    onSuccess: () => {
      // Setelah berhasil tambah user, refresh data user
      queryClient.invalidateQueries({ queryKey: ["users-data"] });
      // Atau, jika ingin update cache lokal:
      // queryClient.setQueryData(["users-data"], (old) => ({ ...old, users: [...old.users, newUser] }));
    },
  });

  // Auto close modal jika berhasil add user
  useEffect(() => {
    if (state?.message && !state?.errors) {
      // Tunggu sebentar agar user bisa lihat pesan sukses (opsional)
      const timer = setTimeout(() => {
        onClose();
        // Trigger refresh data jika callback tersedia
        if (onUserAdded) {
          onUserAdded();
        }
      }, 500); // Kurangi delay menjadi 500ms

      return () => clearTimeout(timer);
    }
  }, [state?.message, state?.errors, onClose, onUserAdded]);

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
  };

  const userRoles = [
    { key: "super_admin", label: "Super Admin" },
    { key: "admin_heavy", label: "Admin Heavy" },
    { key: "admin_elec", label: "Admin Electrical" },
    { key: "pengawas", label: "Pengawas" },
    { key: "mekanik", label: "Mekanik" },
  ];

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Add New User</h2>
      </ModalHeader>

      <ModalBody>
        <form action={handleSubmit} className="space-y-4" id="addUserForm">
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
                // "shadow-xl",
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
                // "shadow-xl",
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
            label="Email"
            name="email"
            placeholder="Enter email address"
            type="email"
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
                // "shadow-xl",
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
            label="Password"
            name="password"
            placeholder="Enter password"
            type="password"
            variant="bordered"
          />

          <Select
            isRequired
            classNames={{
              label: "text-black/50 dark:text-white/90",
              trigger: [
                // "shadow-xl",
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
            items={userRoles}
            label="Role"
            name="role"
            placeholder="Select user role"
            variant="bordered"
          >
            {(userRole) => <SelectItem>{userRole.label}</SelectItem>}
            {/* <SelectItem key="super_admin">Super Admin</SelectItem>
            <SelectItem key="admin_heavy">Admin Heavy</SelectItem>
            <SelectItem key="admin_elec">Admin Electrical</SelectItem>
            <SelectItem key="pengawas">Pengawas</SelectItem>
            <SelectItem key="mekanik">Mekanik</SelectItem> */}
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
                // "shadow-xl",
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
            label="Department"
            name="department"
            placeholder="Enter department (optional)"
            variant="bordered"
          />

          {/* Success Message */}
          {state?.message && (
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
          isDisabled={isPending}
          variant="light"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          className="font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          color="primary"
          form="addUserForm"
          isDisabled={isPending}
          isLoading={isPending}
          type="submit"
        >
          {isPending ? "Adding User..." : "Add User"}
        </Button>
      </ModalFooter>
    </>
  );
}
