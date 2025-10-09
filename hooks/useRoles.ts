// hooks/useRoles.ts
import { useEffect, useState } from "react";

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    roleAccess: number;
  };
}

export interface CreateRoleData {
  code: string;
  name: string;
  description?: string;
  color?: string;
  priority?: number;
}

export interface UpdateRoleData {
  code?: string;
  name?: string;
  description?: string;
  color?: string;
  priority?: number;
  isActive?: boolean;
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roles");

      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();

      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData): Promise<Role> => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roleData),
    });

    if (!res.ok) {
      const error = await res.json();

      throw new Error(error.message || "Failed to create role");
    }

    const newRole = await res.json();

    setRoles((prev) =>
      [...prev, newRole].sort((a, b) => a.priority - b.priority),
    );

    return newRole;
  };

  const updateRole = async (
    id: string,
    roleData: UpdateRoleData,
  ): Promise<Role> => {
    const res = await fetch(`/api/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roleData),
    });

    if (!res.ok) {
      const error = await res.json();

      throw new Error(error.message || "Failed to update role");
    }

    const updatedRole = await res.json();

    setRoles((prev) =>
      prev
        .map((role) => (role.id === id ? updatedRole : role))
        .sort((a, b) => a.priority - b.priority),
    );

    return updatedRole;
  };

  const deleteRole = async (id: string): Promise<void> => {
    const res = await fetch(`/api/roles/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();

      throw new Error(error.message || "Failed to delete role");
    }

    setRoles((prev) => prev.filter((role) => role.id !== id));
  };

  const toggleRoleStatus = async (
    id: string,
    isActive: boolean,
  ): Promise<Role> => {
    return updateRole(id, { isActive });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
  };
}

// Hook untuk get role options untuk form
export function useRoleOptions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/roles");

        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();

        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const roleOptions = roles
    .filter((role) => role.isActive)
    .map((role) => ({
      value: role.code, // Gunakan code, bukan id
      label: role.name,
      code: role.code,
      color: role.color,
    }));

  return { roleOptions, loading, error };
}

// Hook untuk role mapping/display (lightweight)
export function useRoleMap() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/roles");

        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();

        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const roleMap = roles.reduce(
    (acc, role) => {
      acc[role.code] = {
        name: role.name,
        color: role.color,
      };

      return acc;
    },
    {} as Record<string, { name: string; color: string }>,
  );

  const getRoleLabel = (roleCode: string): string => {
    return roleMap[roleCode]?.name || roleCode;
  };

  const getRoleColor = (roleCode: string): string => {
    return roleMap[roleCode]?.color || "default";
  };

  return { roleMap, getRoleLabel, getRoleColor, loading, error };
}
