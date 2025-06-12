"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiSettings,
  FiPackage,
  FiBarChart2,
  FiUsers,
  FiCodesandbox,
} from "react-icons/fi";
import { PiWrench } from "react-icons/pi";
import { LuLayoutDashboard } from "react-icons/lu";

import { LoadingSpinner } from "../skeleton";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// Key untuk localStorage
const ACTIVE_TABS_KEY = "dashboard-active-tabs";
const ACTIVE_TAB_KEY = "dashboard-active-tab";

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
  const [tabsInitialized, setTabsInitialized] = useState(false);

  const [tabLoading, setTabLoading] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: "/dashboard",
      icon: <LuLayoutDashboard />,
    },
    {
      id: "workorders",
      title: "Work Orders",
      path: "/dashboard/workorders",
      icon: <PiWrench />,
    },
    {
      id: "assets",
      title: "Assets",
      path: "/dashboard/assets",
      icon: <FiPackage />,
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
    {
      id: "beta",
      title: "Beta",
      path: "/dashboard/beta",
      icon: <FiCodesandbox />,
    },
  ];

  // Function untuk mendapatkan matched item berdasarkan pathname
  const getMatchedItem = (path: string) => {
    // Cari exact match dulu
    let matchedItem = navItems.find((item) => item.path === path);

    // Jika tidak ada exact match, cari yang starts with
    if (!matchedItem) {
      matchedItem = navItems.find(
        (item) => path.startsWith(item.path) && item.path !== "/dashboard",
      );
    }

    // Jika masih tidak ada dan path dimulai dengan /dashboard, return dashboard
    if (!matchedItem && path.startsWith("/dashboard")) {
      matchedItem = navItems.find((item) => item.id === "dashboard");
    }

    return matchedItem;
  };

  // Function untuk save tabs ke localStorage
  const saveTabsToStorage = (tabs: any[], currentActiveTab: string) => {
    try {
      // Serialize tabs tanpa icon (karena React elements tidak bisa diserialisasi)
      const tabsForStorage = tabs.map(({ icon: _icon, ...tab }) => tab);
      // const tabsForStorage = tabs.map(({ icon, ...tab }) => tab);

      localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(tabsForStorage));
      localStorage.setItem(ACTIVE_TAB_KEY, currentActiveTab);
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Error saving tabs to storage:", error);
    }
  };

  // Function untuk load tabs dari localStorage
  const loadTabsFromStorage = () => {
    try {
      const savedTabs = localStorage.getItem(ACTIVE_TABS_KEY);
      const savedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);

      if (savedTabs && savedActiveTab) {
        const parsedTabs = JSON.parse(savedTabs);

        // Reconstruct icons dan validate tabs
        const validTabs = parsedTabs
          .map((tab: any) => {
            const navItem = navItems.find((item) => item.id === tab.id);

            return navItem ? { ...navItem } : null;
          })
          .filter(Boolean);

        if (validTabs.length > 0) {
          setActiveTabs(validTabs);

          // Validate active tab
          const isValidActiveTab = validTabs.some(
            (tab: any) => tab.id === savedActiveTab,
          );

          if (isValidActiveTab) {
            setActiveTab(savedActiveTab);
          } else {
            setActiveTab(validTabs[0].id);
          }

          return true;
        }
      }
      /* eslint-disable no-console */
    } catch (error) {
      console.error("Error loading tabs from storage:", error);
    }

    return false;
  };

  // Function untuk initialize tabs
  const initializeTabs = () => {
    const currentMatchedItem = getMatchedItem(pathname);

    if (currentMatchedItem) {
      setActiveTabs([currentMatchedItem]);
      setActiveTab(currentMatchedItem.id);
      saveTabsToStorage([currentMatchedItem], currentMatchedItem.id);
    } else {
      // Fallback ke dashboard
      const dashboardTab = navItems.find((item) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab]);
        setActiveTab(dashboardTab.id);
        saveTabsToStorage([dashboardTab], dashboardTab.id);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize tabs setelah client ready
  useEffect(() => {
    if (!isClient || tabsInitialized) return;

    const hasLoadedFromStorage = loadTabsFromStorage();

    if (!hasLoadedFromStorage) {
      initializeTabs();
    }

    setTabsInitialized(true);
  }, [isClient, pathname]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Sync dengan pathname changes setelah tabs initialized
  useEffect(() => {
    if (!tabsInitialized || !isClient) return;

    const currentMatchedItem = getMatchedItem(pathname);

    if (currentMatchedItem) {
      // Cek apakah tab sudah ada di activeTabs
      const existingTab = activeTabs.find(
        (tab) => tab.id === currentMatchedItem.id,
      );

      if (existingTab) {
        // Tab sudah ada, hanya update activeTab
        if (activeTab !== currentMatchedItem.id) {
          setActiveTab(currentMatchedItem.id);
          saveTabsToStorage(activeTabs, currentMatchedItem.id);
        }
      } else {
        // Tab belum ada, tambahkan ke activeTabs
        const newTabs = [...activeTabs, currentMatchedItem];

        setActiveTabs(newTabs);
        setActiveTab(currentMatchedItem.id);
        saveTabsToStorage(newTabs, currentMatchedItem.id);
      }
    }
  }, [pathname, tabsInitialized, isClient]);

  useEffect(() => {
    setTabLoading(false);
  }, [pathname]);

  const handleTabClick = (tab: any) => {
    if (activeTab !== tab.id) {
      setActiveTab(tab.id);
      setTabLoading(true);
      router.push(tab.path);
      saveTabsToStorage(activeTabs, tab.id);
    }
  };

  const openNewTab = (tab: any) => {
    const existingTab = activeTabs.find((t) => t.id === tab.id);

    if (!existingTab) {
      const newTabs = [...activeTabs, tab];

      setActiveTabs(newTabs);
      saveTabsToStorage(newTabs, tab.id);
    }

    if (activeTab !== tab.id) {
      setActiveTab(tab.id);
      setTabLoading(true);
      router.push(tab.path);
    }
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = activeTabs.filter((tab) => tab.id !== tabId);

    if (newTabs.length === 0) {
      // Jika semua tabs ditutup, kembali ke dashboard
      const dashboardTab = navItems.find((item) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab]);
        setActiveTab(dashboardTab.id);
        saveTabsToStorage([dashboardTab], dashboardTab.id);
        router.push(dashboardTab.path);
      }

      return;
    }

    setActiveTabs(newTabs);

    if (activeTab === tabId) {
      // Jika tab yang ditutup adalah active tab, pindah ke tab terakhir
      const lastTab = newTabs[newTabs.length - 1];

      setActiveTab(lastTab.id);
      saveTabsToStorage(newTabs, lastTab.id);
      router.push(lastTab.path);
    } else {
      // Jika bukan active tab, hanya update storage
      saveTabsToStorage(newTabs, activeTab);
    }
  };

  if (!isClient || status === "loading" || !tabsInitialized) {
    return <LoadingSpinner />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Fixed */}
      <div className="flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          navItems={navItems}
          openNewTab={openNewTab}
          session={session}
          setSidebarCollapsed={setSidebarCollapsed}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Fixed */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 bg-background p-6 overflow-auto relative">
          {tabLoading && (
            <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <div className={tabLoading ? "opacity-50 pointer-events-none" : ""}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
