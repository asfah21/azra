"use client";

import { Divider, Tooltip, Button } from "@heroui/react";
import { memo, useMemo, useState } from "react";

import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Logo, LogoGsi } from "@/components/icons";
import { ChevronDown } from "lucide-react";

// (Deklarasi interface dihapus, gunakan tipe ekspor di bawah)
export type SidebarNavItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children?: SidebarNavChild[];
  [key: string]: any;
};

export type SidebarNavChild = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  [key: string]: any;
};

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  navItems: Array<SidebarNavItem | SidebarNavChild>;
  activeTab: string;
  openNewTab: (tab: SidebarNavItem | SidebarNavChild) => void;
  session: any;
}

// Memoized NavButton untuk mencegah re-render yang tidak perlu
const NavButton = memo(
  ({
    item,
    isActive,
    sidebarCollapsed,
    onPress,
  }: {
    item: any;
    isActive: boolean;
    sidebarCollapsed: boolean;
    onPress: () => void;
  }) => (
    <Tooltip
      content={item.title}
      isDisabled={!sidebarCollapsed}
      placement="right"
    >
      <Button
        className={`w-full transition-all duration-200 ease-out ${
          sidebarCollapsed ? "justify-center min-w-12 px-0" : "justify-start"
        } h-12`}
        color={isActive ? "primary" : "default"}
        startContent={
          <span className="text-lg flex-shrink-0">{item.icon}</span>
        }
        variant={isActive ? "flat" : "light"}
        onPress={onPress}
      >
        <span
          className={`transition-all duration-200 ease-out whitespace-nowrap ${
            sidebarCollapsed
              ? "opacity-0 w-0 overflow-hidden ml-0"
              : "opacity-100 w-auto ml-2"
          }`}
        >
          {item.title}
        </span>
      </Button>
    </Tooltip>
  ),
);

NavButton.displayName = "NavButton";

export const Sidebar = memo(function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  navItems,
  activeTab,
  openNewTab,
  session,
}: SidebarProps) {
  // State untuk expand/collapse group menu
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  // Ambil konfigurasi akses dari backend
  const { roleAccess, loading } = useRoleAccess();
  const userRole = session?.user?.role;

  // Filter menu sesuai role user dan konfigurasi akses
  const filteredNavItems = useMemo(() => {
    if (!userRole || loading) return null;
    if (userRole === "super_admin") {
      return navItems;
    }

    // roleAccess: array of { menu, role }
    return navItems.filter((item) =>
      roleAccess.some(
        (access) => access.menu === item.id && access.role === userRole,
      ),
    );
  }, [navItems, roleAccess, userRole, loading]);

  return (
    <aside
      className={`bg-content1 border-r border-divider h-full md:h-screen shadow-small transition-all duration-200 ease-out ${
        sidebarCollapsed ? "w-20" : "w-64"
      } hidden md:flex flex-col relative`}
      style={{
        transform: "translateZ(0)",
        willChange: "width",
      }}
    >
      {/* Header Section */}
      <div
        className={`flex items-center transition-all duration-200 ease-out ${
          !sidebarCollapsed ? "justify-between" : "justify-center"
        } px-4 py-5 flex-shrink-0`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {sidebarCollapsed ? <LogoGsi /> : <Logo />}
        </div>
      </div>

      <Divider />

      {/* Navigation Section */}
      <nav className="flex-1 flex flex-col gap-1 p-3 min-h-0 overflow-hidden">
        {filteredNavItems &&
          filteredNavItems.length > 0 &&
          filteredNavItems.map((item) => {
            const isActive = activeTab === item.id;
            // Jika item punya children, tampilkan tombol expand/collapse
            if ('children' in item && item.children && item.children.length > 0) {
              // Untuk super_admin, tampilkan semua child tanpa filter
              const childrenToShow = userRole === "super_admin"
                ? item.children
                : item.children.filter((child: SidebarNavChild) =>
                    roleAccess.some(
                      (access) => access.menu === child.id && access.role === userRole,
                    ),
                  );
              if (childrenToShow.length === 0) return null;
              return (
                <div key={item.id} className="relative">
                  <Button
                    className={`w-full transition-all duration-200 ease-out ${sidebarCollapsed ? "justify-center min-w-12 px-0" : "justify-start"} h-12`}
                    startContent={<span className="text-lg flex-shrink-0">{item.icon}</span>}
                    endContent={<span className={`ml-auto transition-transform ${expandedMenus[item.id] ? "rotate-180" : "rotate-0"}`}><ChevronDown size={18}/></span>}
                    variant={isActive ? "flat" : "light"}
                    onPress={() => setExpandedMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  >
                    <span className={`transition-all duration-200 ease-out whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden ml-0" : "opacity-100 w-auto ml-2"}`}>{item.title}</span>
                  </Button>
                  {expandedMenus[item.id] && (
                    <div className="pl-8 pt-1">
                      {childrenToShow.map((child: SidebarNavChild) => (
                        <Button
                          key={child.id}
                          className="w-full h-10 justify-start"
                          variant={activeTab === child.id ? "flat" : "light"}
                          startContent={<span className="text-lg">{child.icon}</span>}
                          onPress={() => openNewTab(child)}
                        >
                          <span className="ml-2">{child.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            // Menu biasa
            return (
              <NavButton
                key={item.id}
                isActive={isActive}
                item={item}
                sidebarCollapsed={sidebarCollapsed}
                onPress={() => openNewTab(item)}
              />
            );
          })}
      </nav>
    </aside>
  );
});
