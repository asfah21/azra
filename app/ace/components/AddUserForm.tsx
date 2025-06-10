"use client";

import { useActionState, useEffect } from "react";
import { ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

import { addUser } from "../actions/action";

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

export function AddUserForm({ onClose, onUserAdded }: AddUserFormProps) {
  const [state, formAction] = useActionState(addUser, null);

  // Auto close modal jika berhasil add user
  useEffect(() => {
    if (state?.message) {
      // Tunggu sebentar agar user bisa lihat pesan sukses
      const timer = setTimeout(() => {
        onClose();
        // Trigger refresh data jika callback tersedia
        if (onUserAdded) {
          onUserAdded();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state?.message, onClose, onUserAdded]);

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">Add New User</ModalHeader>

      <ModalBody>
        <form action={handleSubmit} className="space-y-4" id="addUserForm">
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="name"
            placeholder="Name"
          />
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="email"
            placeholder="Email"
            type="email"
          />
          <input
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="password"
            placeholder="Password"
            type="password"
          />

          <select
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="role"
          >
            <option value="">Pilih Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin_heavy">Admin Heavy</option>
            <option value="admin_elec">Admin Electrical</option>
            <option value="pengawas">Pengawas</option>
            <option value="mekanik">Mekanik</option>
          </select>

          <input
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="department"
            placeholder="Department (opsional)"
          />

          {/* Tampilkan pesan sukses */}
          {state?.message && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm">{state.message}</p>
            </div>
          )}

          {/* Tampilkan error */}
          {state?.errors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{state.errors.general}</p>
            </div>
          )}
          {state?.errors?.email && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{state.errors.email}</p>
            </div>
          )}
        </form>
      </ModalBody>

      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="primary" form="addUserForm" type="submit">
          Add User
        </Button>
      </ModalFooter>
    </>
  );
}
