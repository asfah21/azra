"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { FiSettings, FiPackage, FiBarChart2, FiUsers } from "react-icons/fi";
import { PiWrench } from "react-icons/pi";
import { LuLayoutDashboard } from "react-icons/lu";

import { LoadingSpinner } from "../skeleton";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// Key untuk localStorage
export const ACTIVE_TABS_KEY = "dashboard-active-tabs";
export const ACTIVE_TAB_KEY = "dashboard-active-tab";

// Function to clear tab state from localStorage
export const clearTabState = () => {
  try {
    localStorage.removeItem(ACTIVE_TABS_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
  } catch (error) {
    console.error("Error clearing tab state:", error);
  }
};

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Ref untuk tracking navigation state
  const isNavigatingRef = useRef(false);
  const lastPathnameRef = useRef(pathname);

  const navItems = useMemo(
    () => [
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
    ],
    [],
  );

  // Optimized pathname matcher
  const getMatchedItem = useCallback(
    (path: string) => {
      // Direct match first (most common case)
      const directMatch = navItems.find((item) => item.path === path);

      if (directMatch) return directMatch;

      // Prefix match (excluding dashboard for specificity)
      const prefixMatch = navItems.find(
        (item) => path.startsWith(item.path) && item.path !== "/dashboard",
      );

      if (prefixMatch) return prefixMatch;

      // Dashboard fallback for any /dashboard/* path
      if (path.startsWith("/dashboard")) {
        return navItems.find((item) => item.id === "dashboard");
      }

      return null;
    },
    [navItems],
  );

  // Optimized storage operations dengan batching
  const saveTabsToStorage = useCallback(
    (tabs: any[], currentActiveTab: string) => {
      // Batch storage operations
      requestAnimationFrame(() => {
        try {
          const tabsForStorage = tabs.map(({ icon: _icon, ...tab }) => tab);

          localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(tabsForStorage));
          localStorage.setItem(ACTIVE_TAB_KEY, currentActiveTab);
        } catch (error) {
          console.error("Error saving tabs to storage:", error);
        }
      });
    },
    [],
  );

  const loadTabsFromStorage = useCallback(() => {
    try {
      const savedTabs = localStorage.getItem(ACTIVE_TABS_KEY);
      const savedActiveTab = localStorage.getItem(ACTIVE_TAB_KEY);

      if (savedTabs && savedActiveTab) {
        const parsedTabs = JSON.parse(savedTabs);
        const validTabs = parsedTabs
          .map((tab: any) => {
            const navItem = navItems.find((item) => item.id === tab.id);

            return navItem ? { ...navItem } : null;
          })
          .filter(Boolean);

        if (validTabs.length > 0) {
          const isValidActiveTab = validTabs.some(
            (tab: any) => tab.id === savedActiveTab,
          );

          return {
            tabs: validTabs,
            activeTab: isValidActiveTab ? savedActiveTab : validTabs[0].id,
          };
        }
      }
    } catch (error) {
      console.error("Error loading tabs from storage:", error);
    }

    return null;
  }, [navItems]);

  // Handle session redirect
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [status, session, router]);

  // Single initialization effect
  useEffect(() => {
    if (status === "loading" || !session) return;

    const currentMatchedItem = getMatchedItem(pathname);
    const savedData = loadTabsFromStorage();

    if (savedData) {
      // Check if current path matches the active tab
      const savedActiveTab = navItems.find(
        (item) => item.id === savedData.activeTab,
      );
      const currentPathTab = navItems.find((item) => item.path === pathname);

      if (
        currentPathTab &&
        (!savedActiveTab || currentPathTab.id !== savedData.activeTab)
      ) {
        // If current path doesn't match saved active tab, update to match current path
        setActiveTab(currentPathTab.id);
        setActiveTabs((prevTabs) => {
          const tabExists = prevTabs.some(
            (tab) => tab.id === currentPathTab.id,
          );
          const newTabs = tabExists ? prevTabs : [...prevTabs, currentPathTab];

          saveTabsToStorage(newTabs, currentPathTab.id);

          return newTabs;
        });
      } else {
        // Use saved data
        setActiveTabs(savedData.tabs);
        setActiveTab(savedData.activeTab);
      }
    } else if (currentMatchedItem) {
      // No saved data, initialize with current path
      setActiveTabs([currentMatchedItem]);
      setActiveTab(currentMatchedItem.id);
      saveTabsToStorage([currentMatchedItem], currentMatchedItem.id);
    } else {
      // Fallback to dashboard
      const dashboardTab = navItems.find((item) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab]);
        setActiveTab(dashboardTab.id);
        saveTabsToStorage([dashboardTab], dashboardTab.id);
      }
    }

    setIsInitialized(true);

    setIsInitialized(true);
  }, [
    status,
    session,
    pathname,
    getMatchedItem,
    loadTabsFromStorage,
    saveTabsToStorage,
    navItems,
    isInitialized,
  ]);

  // Optimized pathname sync dengan debouncing
  useEffect(() => {
    if (!isInitialized || isNavigatingRef.current) return;

    // Skip jika pathname tidak berubah
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    const currentMatchedItem = getMatchedItem(pathname);

    if (!currentMatchedItem) return;

    // Batch state updates
    const updateTabs = () => {
      setActiveTabs((prevTabs) => {
        const existingTab = prevTabs.find(
          (tab) => tab.id === currentMatchedItem.id,
        );

        if (existingTab) {
          if (activeTab !== currentMatchedItem.id) {
            setActiveTab(currentMatchedItem.id);
            saveTabsToStorage(prevTabs, currentMatchedItem.id);
          }

          return prevTabs;
        } else {
          const newTabs = [...prevTabs, currentMatchedItem];

          setActiveTab(currentMatchedItem.id);
          saveTabsToStorage(newTabs, currentMatchedItem.id);

          return newTabs;
        }
      });
    };

    // Use requestAnimationFrame untuk smooth updates
    requestAnimationFrame(updateTabs);
  }, [pathname, isInitialized, getMatchedItem, saveTabsToStorage, activeTab]);

  // Navigation state
  const [pendingNavigation, setPendingNavigation] = useState<{
    path: string;
    tabId: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle navigation after state updates
  useEffect(() => {
    if (pendingNavigation) {
      isNavigatingRef.current = true;

      startTransition(() => {
        router.push(pendingNavigation.path);
        // Reset flag after navigation
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      });

      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  const handleTabClick = useCallback(
    (tab: any) => {
      if (activeTab === tab.id) return;

      setActiveTab(tab.id);
      saveTabsToStorage(activeTabs, tab.id);
      setPendingNavigation({ path: tab.path, tabId: tab.id });
    },
    [activeTab, activeTabs, saveTabsToStorage],
  );

  const openNewTab = useCallback(
    (tab: any) => {
      if (activeTab === tab.id) return;

      setActiveTabs((prevTabs) => {
        const existingTab = prevTabs.find((t) => t.id === tab.id);
        const newTabs = existingTab ? prevTabs : [...prevTabs, tab];

        return newTabs;
      });

      setActiveTab(tab.id);
      saveTabsToStorage(activeTabs, tab.id);
      setPendingNavigation({ path: tab.path, tabId: tab.id });
    },
    [activeTab, activeTabs, saveTabsToStorage],
  );

  const closeTab = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      setActiveTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

        if (newTabs.length === 0) {
          const dashboardTab = navItems.find((item) => item.id === "dashboard");

          if (dashboardTab) {
            setActiveTab(dashboardTab.id);
            saveTabsToStorage([dashboardTab], dashboardTab.id);
            setPendingNavigation({
              path: dashboardTab.path,
              tabId: dashboardTab.id,
            });

            return [dashboardTab];
          }

          return prevTabs;
        }

        if (activeTab === tabId) {
          const lastTab = newTabs[newTabs.length - 1];

          setActiveTab(lastTab.id);
          saveTabsToStorage(newTabs, lastTab.id);
          setPendingNavigation({ path: lastTab.path, tabId: lastTab.id });
        } else {
          saveTabsToStorage(newTabs, activeTab);
        }

        return newTabs;
      });
    },
    [activeTab, saveTabsToStorage, navItems],
  );

  // Handle sign out with tab state cleanup
  const handleSignOut = useCallback(() => {
    clearTabState();
    signOut({ callbackUrl: "/login" });
  }, []);

  // Show loading hanya saat benar-benar loading
  if (status === "loading" || !isInitialized) {
    return <LoadingSpinner />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <Topbar
            activeTab={activeTab}
            activeTabs={activeTabs}
            closeTab={closeTab}
            handleTabClick={handleTabClick}
            menuOpen={menuOpen}
            navItems={navItems}
            openNewTab={openNewTab}
            session={session}
            setMenuOpen={setMenuOpen}
            setSidebarCollapsed={setSidebarCollapsed}
            sidebarCollapsed={sidebarCollapsed}
            signOut={handleSignOut}
          />
        </div>

        <main className="flex-1 bg-background p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
