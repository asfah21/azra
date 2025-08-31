// lib/utils/roleAccess.ts

type NavItemID = string;
type Role =
  | "super_admin"
  | "admin_heavy"
  | "admin_elec"
  | "pengawas"
  | "mekanik"
  | "guest";

export const DEFAULT_ROLES: Role[] = [
  "super_admin",
  "admin_heavy",
  "admin_elec",
  "pengawas",
  "mekanik",
  "guest",
];

// Mendapatkan konfigurasi role access dari localStorage
export function getRoleAccess(): Record<NavItemID, Role[]> {
  if (typeof window === "undefined") return {};

  const saved = localStorage.getItem("roleAccess");

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse roleAccess from localStorage", e);
    }
  }

  return {};
}

// Menyimpan konfigurasi role access ke localStorage
export function saveRoleAccess(access: Record<NavItemID, Role[]>): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("roleAccess", JSON.stringify(access));
  } catch (e) {
    console.error("Failed to save roleAccess to localStorage", e);
  }
}

// Mengupdate akses untuk item navigasi tertentu
export function updateRoleAccess(navItemId: NavItemID, roles: Role[]): void {
  const access = getRoleAccess();

  access[navItemId] = roles;
  saveRoleAccess(access);
}

// Memeriksa apakah role memiliki akses ke nav item tertentu
export function hasRoleAccess(navItemId: NavItemID, userRole: Role): boolean {
  const access = getRoleAccess();
  const allowedRoles = access[navItemId];

  // Jika belum ada konfigurasi, gunakan default (semua role bisa akses)
  if (!allowedRoles) return true;

  return allowedRoles.includes(userRole);
}
