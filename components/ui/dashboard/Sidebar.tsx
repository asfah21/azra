"use client";

import { Divider, Tooltip, Button } from "@heroui/react";
import { memo } from "react";

import { VersionApp } from "../ChipVersion";
import { Logo } from "@/components/icons";

interface SidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  navItems: {
    id: string;
    title: string;
    path: string;
    icon: React.ReactNode;
  }[];
  activeTab: string;
  openNewTab: (tab: any) => void;
  session: any;
}

// Memoized NavButton untuk mencegah re-render yang tidak perlu
const NavButton = memo(({ 
  item, 
  isActive, 
  sidebarCollapsed, 
  onPress 
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
        sidebarCollapsed
          ? "justify-center min-w-12 px-0"
          : "justify-start"
      } h-12`}
      color={isActive ? "primary" : "default"}
      startContent={<span className="text-lg flex-shrink-0">{item.icon}</span>}
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
));

NavButton.displayName = "NavButton";

export const Sidebar = memo(function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed: _setSidebarCollapsed,
  navItems,
  activeTab,
  openNewTab,
  session,
}: SidebarProps) {
  return (
    <aside
      className={`bg-content1 border-r border-divider h-full md:h-screen shadow-small transition-all duration-200 ease-out ${
        sidebarCollapsed ? "w-20" : "w-64"
      } hidden md:flex flex-col relative`}
      style={{
        // Force hardware acceleration untuk smooth transitions
        transform: 'translateZ(0)',
        willChange: 'width'
      }}
    >
      {/* Header Section */}
      <div
        className={`flex items-center transition-all duration-200 ease-out ${
          !sidebarCollapsed ? "justify-between" : "justify-center"
        } px-4 py-5 flex-shrink-0`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              <Logo />
            </span>
          </div>
          <div
            className={`transition-all duration-200 ease-out min-w-0 ${
              sidebarCollapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 w-auto"
            }`}
          >
            {!sidebarCollapsed && <VersionApp />}
          </div>
        </div>
      </div>

      <Divider />

      {/* Navigation Section */}
      <nav className="flex-1 flex flex-col gap-1 p-3 min-h-0 overflow-hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive}
              sidebarCollapsed={sidebarCollapsed}
              onPress={() => openNewTab(item)}
            />
          );
        })}
      </nav>
    </aside>
  );
});