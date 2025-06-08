"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  IconLink,
  IconMonitor,
  StatusMonitoring,
  MultiRoleAccess,
  DashboardIcon,
  OpenSidebar,
  CloseSidebar,
} from "@/components/MyIcon";

export default function UIAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (!mounted) return null;

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const sidebarBg = theme === "dark" ? "bg-[#111827]" : "bg-white";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200";
  const mobileNavBg = theme === "dark" ? "bg-[#1f2937]" : "bg-gray-50";
  const hoverText =
    theme === "dark" ? "hover:text-blue-400" : "hover:text-blue-600";

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <DashboardIcon />,
      children: [
        { label: "Ecommerce", href: "/admin/ecommerce" },
        { label: "Analytics", href: "/admin/analytics" },
      ],
    },
    { label: "Profile", href: "/admin/profile", icon: <IconLink /> },
    { label: "Pengaturan", href: "/admin/settings", icon: <IconLink /> },
  ];

  return (
    <div
      className={`min-h-screen ${bgColor} ${textColor} flex flex-col md:flex-row`}
    >
      {/* Sidebar */}
      <aside
        className={`${sidebarBg} border-r border-gray-300 h-full md:h-screen shadow-md transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } hidden md:flex flex-col`}
      >
        <div
          className={`flex items-center ${!sidebarCollapsed ? "justify-between" : "justify-center"} p-4`}
        >
          <span className="text-lg font-bold flex items-center">
            <IconMonitor />
            {!sidebarCollapsed && <div className="pl-2">TailAdmin</div>}
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-2">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                // Jika ada children: pakai button untuk toggle submenu
                <button
                  className={`w-full flex items-center gap-3 p-2 rounded-md ${hoverBg} transition ${
                    sidebarCollapsed ? "justify-center" : "justify-between"
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <div
                    className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center w-full" : ""}`}
                  >
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span>{openSubmenus[item.label] ? "▾" : "▸"}</span>
                  )}
                </button>
              ) : (
                // Jika tidak ada children: langsung pakai Link
                <Link
                  className={`w-full flex items-center gap-3 p-2 rounded-md ${hoverBg} transition ${
                    sidebarCollapsed ? "justify-center" : "justify-start"
                  }`}
                  href={item.href}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              )}

              {/* Submenu */}
              {!sidebarCollapsed &&
                item.children &&
                openSubmenus[item.label] && (
                  <div className="ml-10 mt-1 flex flex-col gap-1">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.href}
                        className={`text-sm p-2 rounded-md ${hoverBg} transition ${hoverText}`}
                        href={sub.href}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Topbar (mobile only) */}
      <header
        className={`w-full md:hidden ${sidebarBg} shadow p-4 flex justify-between items-center`}
      >
        <button className={textColor} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <MultiRoleAccess /> : <StatusMonitoring />}
        </button>
        <h1 className="text-xl font-bold">TailAdmin</h1>
        <button className={textColor}>Aku</button>
      </header>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <nav
          className={`md:hidden absolute top-16 left-0 right-0 ${mobileNavBg} ${textColor} p-4 space-y-2 z-50 shadow-lg`}
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                className={`flex items-center gap-2 ${hoverText}`}
                href={item.href}
              >
                {item.icon}
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {item.children.map((sub) => (
                    <Link
                      key={sub.href}
                      className={`text-sm ${hoverText}`}
                      href={sub.href}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <nav
          className={`hidden md:flex justify-between items-center ${sidebarBg} px-6 py-4 shadow border-b border-gray-300`}
        >
          <div className="flex items-center">
            <button
              className={textColor}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <span className="text-xl">
                {sidebarCollapsed ? <CloseSidebar /> : <OpenSidebar />}
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Link className={`${textColor} ${hoverText}`} href="/login">
              Login
            </Link>
            <Link className={`${textColor} ${hoverText}`} href="/about">
              About
            </Link>
          </div>
        </nav>

        <main className={`flex-1 ${bgColor} p-4`}>{children}</main>
      </div>
    </div>
  );
}
