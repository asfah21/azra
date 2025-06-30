"use client";

import { useOptimistic, startTransition } from "react";

import { UserPayload } from "../types";
import { convertUserData } from "../hooks/useUsers";
import {
  addUsers,
  updateUser,
  deleteUser,
} from "../action";

export function useOptimisticUsers(initialUsers: UserPayload[]) {
  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    initialUsers,
    (state, newUser: Partial<UserPayload>) => {
      return state.map((user) => {
        if (user.id === newUser.id) {
          // Pastikan data yang diupdate tetap memiliki Date objects
          const updatedUser = { ...user, ...newUser };

          return convertUserData(updatedUser);
        }

        return user;
      });
    },
  );

  const optimisticAddUser = async (formData: FormData) => {
    startTransition(() => {
      // Untuk add, kita tidak bisa optimistic karena belum ada ID
      // Tapi kita bisa menambahkan temporary user
    });

    try {
      const result = await addUsers(null, formData);

      return result;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  const optimisticUpdateUser = async (formData: FormData) => {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;

    startTransition(() => {
      addOptimisticUser({ 
        id, 
        name, 
        email, 
        role, 
        department: department || null 
      });
    });

    try {
      const result = await updateUser(null, formData);

      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const optimisticDeleteUser = async (id: string, currentUserRole?: string) => {
    startTransition(() => {
      addOptimisticUser({ id, name: "deleted" as any });
    });

    try {
      const result = await deleteUser(id, currentUserRole);

      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return {
    optimisticUsers,
    optimisticAddUser,
    optimisticUpdateUser,
    optimisticDeleteUser,
  };
} 