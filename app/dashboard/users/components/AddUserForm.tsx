"use client";

import { useActionState, useEffect, useState } from "react";
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
import { useSession } from "next-auth/react";

import { addUsers } from "../action";

import { consolePino } from "@/lib/logger";

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

export function AddUserForms({ onClose, onUserAdded }: AddUserFormProps) {
  const [state, formAction, isPending] = useActionState(addUsers, null);

  const { data: session } = useSession();

  // Dynamic role options from API

  const [roleOptions, setRoleOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    async function fetchRoles() {
      setRolesLoading(true);
      try {
        const res = await fetch("/api/dashboard/roles");
        const data = await res.json();

        if (Array.isArray(data.roles)) {
          setRoleOptions(
            data.roles.map((role: any) => ({
              value: role.code,
              label: role.name,
            })),
          );
        } else {
          setRoleOptions([]);
        }
      } catch (e) {
        setRoleOptions([]);
      } finally {
        setRolesLoading(false);
      }
    }
    fetchRoles();
  }, []);

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

  // CONDITIONAL RENDERING SETELAH SEMUA HOOKS

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
            isDisabled={rolesLoading}
            isLoading={rolesLoading}
            items={roleOptions}
            label="User Roles"
            labelPlacement="outside-top"
            placeholder={
              rolesLoading ? "Loading roles..." : "Search user roles"
            }
            selectedKey={selectedRole}
            style={{ outline: "none" }}
            variant="bordered"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.style.outline = "none";
            }}
            onSelectionChange={(key) => setSelectedRole(key as string)}
          >
            {(item) => (
              <AutocompleteItem key={item.value} variant="flat">
                {item.label}
              </AutocompleteItem>
            )}
          </Autocomplete>
          {/* Hidden input to ensure correct value is submitted */}
          <input
            required
            name="role"
            type="hidden"
            value={selectedRole || ""}
          />

          {/* FID & NIK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              inputMode="numeric"
              label="FID (Fingerprint ID)"
              labelPlacement="outside-top"
              name="fid"
              pattern="[0-9]*"
              placeholder="Enter FID (optional)"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
            <Input
              inputMode="numeric"
              label="NIK"
              labelPlacement="outside-top"
              name="nik"
              pattern="[0-9]*"
              placeholder="Enter NIK (optional)"
              variant="bordered"
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                e.target.style.outline = "none";
              }}
            />
          </div>

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
