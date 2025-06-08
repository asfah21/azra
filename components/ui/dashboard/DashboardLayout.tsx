"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiHome,
  FiSettings,
  FiPlus,
  FiTruck,
  FiBarChart2,
  FiUsers,
} from "react-icons/fi";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export default function UIDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTabs, setActiveTabs] = useState<any[]>([]);
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

  const handleTabClick = (tab: any) => {
    router.push(tab.path);
    setActiveTab(tab.id);
  };

  const openNewTab = (tab: any) => {
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
      <Sidebar
        activeTab={activeTab}
        navItems={navItems}
        openNewTab={openNewTab}
        session={session}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          activeTab={activeTab}
          activeTabs={activeTabs}
          closeTab={closeTab}
          handleTabClick={handleTabClick}
          menuOpen={menuOpen}
          navItems={navItems}
          openNewTab={openNewTab}
          setMenuOpen={setMenuOpen}
          setSidebarCollapsed={setSidebarCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          signOut={() => signOut({ callbackUrl: "/login" })}
        />

        <main className="flex-1 bg-background p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
