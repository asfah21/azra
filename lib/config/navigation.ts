// This file is auto-generated. Do not edit manually.
import { getRoleAccess } from "@/lib/utils/roleAccess";

// Default configuration for navigation items
export const defaultNavItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas", "mekanik", "guest"]
  },
  {
    id: "workorders",
    title: "Work Orders",
    path: "/dashboard/workorders",
    icon: "wrench",
    defaultRoles: ["admin_heavy", "admin_elec", "mekanik", "guest"]
  },
  {
    id: "assets",
    title: "Assets",
    path: "/dashboard/assets",
    icon: "package",
    defaultRoles: ["admin_heavy", "admin_elec"]
  },
  {
    id: "reports",
    title: "Reports",
    path: "/dashboard/reports",
    icon: "bar-chart-2",
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas"]
  },
  {
    id: "users",
    title: "Users",
    path: "/dashboard/users",
    icon: "users",
    defaultRoles: ["admin_heavy"]
  },
  {
    id: "settings",
    title: "Settings",
    path: "/dashboard/settings",
    icon: "settings",
    defaultRoles: ["admin_heavy"]
  },
  {
    id: "auth",
    title: "Authorization",
    path: "/dashboard/auth",
    icon: "shield",
    defaultRoles: ["admin_heavy"]
  }
] as const;

// Fungsi untuk mendapatkan daftar navigasi dengan role access yang sudah dikonfigurasi
export function getNavItems() {
  if (typeof window === 'undefined') return [];
  
  const roleAccess = getRoleAccess();
  
  return defaultNavItems.map(item => ({
    ...item,
    roles: roleAccess[item.id] || item.defaultRoles
  }));
}

// Ekspor untuk kompatibilitas dengan kode yang ada
export const navItems = getNavItems();

export const roles = [
  {
    "id": "super_admin",
    "name": "Super Admin"
  },
  {
    "id": "admin",
    "name": "Administrator"
  },
  {
    "id": "user",
    "name": "User"
  }
] as const;
