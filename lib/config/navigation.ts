// This file is auto-generated. Do not edit manually.
// Default configuration for navigation items
export const defaultNavItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: "dashboard", // Pengaturan icon ada di iconMap DashboardLayout.tsx
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas", "mekanik", "guest"],
  },
  {
    id: "posts",
    title: "Posts",
    path: "/dashboard/posts",
    icon: "package",
    defaultRoles: ["admin_heavy", "admin_elec"],
  },

  {
    id: "users",
    title: "Users",
    path: "/dashboard/users",
    icon: "users",
    defaultRoles: ["admin_heavy"],
  },

  {
    id: "settings",
    title: "Settings",
    path: "/dashboard/settings",
    icon: "settings",
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas", "mekanik", "guest"],
  },
] as const;

// Hapus fungsi getNavItems dan ekspor navItems. Filtering akses dilakukan di komponen (Sidebar, dsb) dengan data dari backend.

// export const roles = [
//   {
//     "id": "super_admin",
//     "name": "Super Admin"
//   },
//   {
//     "id": "admin",
//     "name": "Administrator"
//   },
//   {
//     "id": "user",
//     "name": "User"
//   }
// ] as const;
