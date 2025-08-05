"use client";

import { useActionState, useEffect } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

import { addUsers } from "../action";

import { consolePino } from "@/lib/logger";

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

export function AddUserForms({ onClose, onUserAdded }: AddUserFormProps) {
  const [state, formAction, isPending] = useActionState(addUsers, null);
  const queryClient = useQueryClient();

  // const [selectedRole, setSelectedRole] = useState("admin_heavy");

  const { data: session } = useSession();

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
    //Add user role to form data
    if (session?.user?.role) {
      formData.append("currentUserRole", session.user.role);
    }

    // Log form data for debugging
    const formDataObj: Record<string, any> = {};

    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    consolePino.info("Form data being submitted:", formDataObj);

    try {
      await formAction(formData);
    } catch (error) {
      consolePino.error("Error in form submission:", error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const userRoles = [
    { label: "Super Admin", key: "super_admin" },
    { label: "Admin Heavy", key: "admin_heavy" },
    { label: "Admin Electrical", key: "admin_elec" },
    { label: "Pengawas", key: "pengawas" },
    { label: "Mekanik", key: "mekanik" },
    { label: "Guest", key: "guest" },
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
            isRequired
            label="Password"
            labelPlacement="outside-top"
            name="password"
            placeholder="Enter password"
            type="password"
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          />

          <Autocomplete
            defaultItems={userRoles}
            defaultSelectedKey="admin_heavy"
            label="User Roles"
            labelPlacement="outside-top"
            name="role"
            placeholder="Search user roles"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
          >
            {(item) => (
              <AutocompleteItem key={item.label} variant="flat">
                {item.key}
              </AutocompleteItem>
            )}
          </Autocomplete>

          {/* <Autocomplete
            defaultItems={userRoles}
            defaultSelectedKey="admin_heavy"
            label="User Roles"
            name="role"
            labelPlacement="outside-top"
            placeholder="Search role"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.outline = "none";
}}
          >
            {(item) => (
              <AutocompleteItem key={item.label} variant="flat">
                {item.key}
              </AutocompleteItem>
            )}
          </Autocomplete> */}

          {/* <Autocomplete
            defaultItems={userRoles}
            selectedKey={selectedRole}
            onSelectionChange={(key) => setSelectedRole(key as string)} // Update saat pilih
            label="Roles"
            name="role"
            labelPlacement="outside-top"
            placeholder="Search role"
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.outline = "none";
}}
          >
            {(item) => (
              <AutocompleteItem key={item.show} variant="flat">
                {item.key}
              </AutocompleteItem>
            )}
          </Autocomplete>

          <input type="hidden" name="role" value={selectedRole || ""} /> */}

          {/* <Select
            isRequired
            labelPlacement="outside"
            items={userRoles}
            label="Role"
            name="role"
            placeholder="Select user role"
            variant="bordered"
          >
            {(userRole) => <SelectItem>{userRole.label}</SelectItem>}
          </Select> */}

          <Input
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
