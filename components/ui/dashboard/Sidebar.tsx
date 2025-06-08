"use client";

import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

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

export function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed: _setSidebarCollapsed,
  navItems,
  activeTab,
  openNewTab,
  session,
}: SidebarProps) {
  return (
    <aside
      className={`bg-content1 border-r border-divider h-full md:h-screen shadow-small transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? "w-20" : "w-64"
      } hidden md:flex flex-col`}
    >
      <div
        className={`flex items-center ${!sidebarCollapsed ? "justify-between" : "justify-center"} px-4 py-5`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              <Logo />
            </span>
          </div>
          {!sidebarCollapsed && <VersionApp />}
        </div>
      </div>

      <Divider />

      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <Tooltip
              key={item.id}
              content={item.title}
              isDisabled={!sidebarCollapsed}
              placement="right"
            >
              <Button
                className={`w-full ${
                  sidebarCollapsed
                    ? "justify-center min-w-12 px-0"
                    : "justify-start"
                } h-12`}
                color={isActive ? "primary" : "default"}
                startContent={<span className="text-lg">{item.icon}</span>}
                variant={isActive ? "flat" : "light"}
                onClick={() => openNewTab(item)}
              >
                {!sidebarCollapsed && item.title}
              </Button>
            </Tooltip>
          );
        })}
      </nav>

      <Divider />

      <div className="p-3">
        {!sidebarCollapsed ? (
          <Card className="bg-default-100">
            <CardBody className="p-3">
              <div className="flex items-center gap-3">
                <Avatar name={session?.user?.name || "User"} size="sm" />
                <div className="flex flex-col">
                  <span className="text-small font-medium text-foreground">
                    {session?.user?.name || "User"}
                  </span>
                  <span className="text-tiny text-default-500">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="flex justify-center">
            <Avatar name={session?.user?.name || "User"} size="sm" />
          </div>
        )}
      </div>
    </aside>
  );
}
