"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiHome,
  FiSettings,
  FiMenu,
  FiX,
  FiBell,
  FiXCircle,
  FiPlus,
  FiTruck,
  FiBarChart2,
  FiUsers,
} from "react-icons/fi";
import { useTheme } from "next-themes";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Tooltip } from "@heroui/tooltip";

import { ThemeSwitch } from "../theme-switch";
import { SearchIcon } from "../icons";

interface Tab {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
}

export default function UIDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, systemTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [isClient, setIsClient] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: "/dashboard",
      icon: <FiHome />,
    },
    {
      id: "workorders",
      title: "Work Orders",
      path: "/dashboard/workorders",
      icon: <FiPlus />,
    },
    {
      id: "assets",
      title: "Assets",
      path: "/dashboard/assets",
      icon: <FiTruck />,
    },
    {
      id: "reports",
      title: "Reports",
      path: "/dashboard/reports",
      icon: <FiBarChart2 />,
    },
    {
      id: "user",
      title: "Users",
      path: "/dashboard/users",
      icon: <FiUsers />,
    },
    {
      id: "settings",
      title: "Settings",
      path: "/dashboard/settings",
      icon: <FiSettings />,
    },
  ];

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        base: "max-w-full sm:max-w-[16rem] h-10",
        mainWrapper: "h-full",
        input: "text-small",
        inputWrapper:
          "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
      }}
      endContent={
        <div className="pointer-events-none flex items-center">
          <Kbd className="hidden lg:inline-block" keys={["command"]}>
            K
          </Kbd>
        </div>
      }
      placeholder="Search..."
      size="sm"
      startContent={<SearchIcon size={18} />}
      type="search"
    />
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!isClient) return;

    const matchedItem = navItems.find((item) => pathname.startsWith(item.path));

    if (
      matchedItem &&
      !activeTabs.some((tab) => tab.path === matchedItem.path)
    ) {
      setActiveTabs([matchedItem]);
      setActiveTab(matchedItem.id);
    }
  }, [pathname, isClient]);

  const handleTabClick = (tab: Tab) => {
    router.push(tab.path);
    setActiveTab(tab.id);
  };

  const openNewTab = (tab: Tab) => {
    if (!activeTabs.some((t) => t.path === tab.path)) {
      setActiveTabs([...activeTabs, tab]);
    }
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = activeTabs.filter((tab) => tab.id !== tabId);

    setActiveTabs(newTabs);

    if (activeTab === tabId && newTabs.length > 0) {
      const lastTab = newTabs[newTabs.length - 1];

      setActiveTab(lastTab.id);
      router.push(lastTab.path);
    } else if (newTabs.length === 0) {
      const dashboardTab = navItems.find((item) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab]);
        setActiveTab(dashboardTab.id);
        router.push(dashboardTab.path);
      }
    }
  };

  if (!isClient || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-small text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside
        className={`bg-content1 border-r border-divider h-full md:h-screen shadow-small transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } hidden md:flex flex-col`}
      >
        <div
          className={`flex items-center ${!sidebarCollapsed ? "justify-between" : "justify-center"} px-4 py-6`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TA</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-foreground">
                TailAdmin
              </span>
            )}
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

      {/* Topbar - Mobile */}
      <header className="w-full md:hidden bg-content1 shadow-small p-4 flex justify-between items-center border-b border-divider">
        <Button
          isIconOnly
          variant="light"
          onPress={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </Button>
        <h1 className="text-xl font-bold text-foreground">TailAdmin</h1>
        <Button isIconOnly variant="light">
          <FiBell size={18} />
        </Button>
      </header>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <Card className="md:hidden absolute top-16 left-0 right-0 z-50 shadow-large rounded-none">
          <CardBody className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <Button
                  key={item.id}
                  className="w-full justify-start h-12"
                  color={isActive ? "primary" : "default"}
                  startContent={<span className="text-lg">{item.icon}</span>}
                  variant={isActive ? "flat" : "light"}
                  onClick={() => {
                    openNewTab(item);
                    setMenuOpen(false);
                  }}
                >
                  {item.title}
                </Button>
              );
            })}
          </CardBody>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation - Desktop */}
        <header className="hidden md:flex justify-between items-center bg-content1 px-6 py-4 shadow-small border-b border-divider">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="bordered"
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <GoSidebarExpand size={18} />
              ) : (
                <GoSidebarCollapse size={18} />
              )}
            </Button>
            <div className="hidden lg:flex">{searchInput}</div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <Button isIconOnly className="text-default-500" variant="light">
              <FiBell size={18} />
            </Button>
            <Button
              className="text-danger"
              startContent={<FiLogOut size={16} />}
              variant="light"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Tabs Bar */}
        <div className="flex items-center bg-content2 border-b border-divider overflow-x-auto px-2 pt-2">
          {activeTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                className="flex items-center ml-1 first:ml-0"
                role="button"
                tabIndex={0}
                onClick={() => handleTabClick(tab)}
                onKeyDown={(e) => {
                  // Handle keyboard interaction (e.g., Enter/Space)
                  if (e.key === "Enter" || e.key === " ") {
                    handleTabClick(tab);
                  }
                }}
              >
                <div
                  className={`px-4 py-2 h-10 rounded-t-lg rounded-b-none border-b-2 transition-colors flex items-center cursor-pointer ${
                    isActive
                      ? "bg-content1 border-primary text-primary"
                      : "bg-transparent border-transparent hover:bg-content3"
                  }`}
                >
                  <span className="text-base mr-2">{tab.icon}</span>
                  <span className="whitespace-nowrap text-small">
                    {tab.title}
                  </span>
                  {activeTabs.length > 1 && (
                    <Button
                      isIconOnly
                      className="min-w-5 w-5 h-5 ml-2 text-default-400 hover:text-danger"
                      size="sm"
                      variant="light"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the tab click
                        closeTab(tab.id, e);
                      }}
                    >
                      <FiXCircle size={14} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="flex-1 bg-background p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
