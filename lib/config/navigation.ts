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
    id: "workorders",
    title: "Work Orders",
    path: "/dashboard/workorders",
    icon: "wrench",
    defaultRoles: ["admin_heavy", "admin_elec", "mekanik", "guest"],
  },
  {
    id: "timesheet",
    title: "Timesheet",
    icon: "clock",
    defaultRoles: ["admin_heavy", "guest"],
    children: [
      {
        id: "timesheetform",
        title: "Form",
        path: "/dashboard/timentry",
        icon: "fileInput",
        defaultRoles: ["admin_heavy", "guest"],
      },
      {
        id: "timesheetlist",
        title: "List",
        path: "/dashboard/timesheetlist",
        icon: "luList",
        defaultRoles: ["admin_heavy", "guest"],
      },
      {
        id: "timesheetall",
        title: "All ",
        path: "/dashboard/timesheetall",
        icon: "ListAll",
        defaultRoles: ["admin_heavy"],
      },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    path: "/dashboard/assets",
    icon: "package",
    defaultRoles: ["admin_heavy", "admin_elec"],
  },
  {
    id: "reports",
    title: "Reports",
    path: "/dashboard/reports",
    icon: "barChart",
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas"],
  },
  {
    id: "users",
    title: "Users",
    path: "/dashboard/users",
    icon: "users",
    defaultRoles: ["admin_heavy"],
  },
  {
    id: "fingerprint",
    title: "Fingerprint",
    path: "/dashboard/fingerprint",
    icon: "fingerprint",
    defaultRoles: ["admin_elec"],
  },
  {
    id: "settings",
    title: "Settings",
    path: "/dashboard/settings",
    icon: "settings",
    defaultRoles: ["admin_heavy", "admin_elec", "pengawas", "mekanik", "guest"],
  },
  {
    id: "auth",
    title: "Authorization",
    path: "/dashboard/auth",
    icon: "shield",
    defaultRoles: ["admin_heavy"],
    // defaultRoles: [],
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
