// hooks/useRoleAccess.ts
import { useEffect, useState } from "react";

export type Role =
  | "super_admin"
  | "admin_heavy"
  | "admin_elec"
  | "pengawas"
  | "mekanik"
  | "guest";

export interface RoleAccess {
  id: string;
  menu: string;
  role: Role;
}

export function useRoleAccess() {
  const [roleAccess, setRoleAccess] = useState<RoleAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoleAccess() {
      setLoading(true);
      try {
        const res = await fetch("/api/role-access");

        if (!res.ok) throw new Error("Failed to fetch role access");
        const data = await res.json();

        setRoleAccess(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRoleAccess();
  }, []);

  return { roleAccess, loading, error };
}
