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

export function useRoleAccess(role?: Role) {
  const [roleAccess, setRoleAccess] = useState<RoleAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function fetchRoleAccess() {
      setLoading(true);
      setError(null);
      try {
        const qs = role ? `?role=${encodeURIComponent(role)}` : "";
        const res = await fetch(`/api/role-access${qs}`, { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch role access");
        const data = (await res.json()) as RoleAccess[];

        if (alive) setRoleAccess(data);
      } catch (err: any) {
        if (alive) {
          setError(err.message ?? "error");
          setRoleAccess([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchRoleAccess();

    return () => {
      alive = false;
    };
  }, [role]);

  return { roleAccess, loading, error };
}
