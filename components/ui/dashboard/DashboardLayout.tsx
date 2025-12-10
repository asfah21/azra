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
  memo,
} from "react";
import {
  FiSettings,
  FiPackage,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiClock,
  FiTool,
} from "react-icons/fi";
import {
  LuFileText,
  LuFileType2,
  LuFingerprint,
  LuLayoutDashboard,
  LuList,
} from "react-icons/lu";

import { LoadingSpinner } from "../skeleton";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

import { consolePino } from "@/lib/logger";
import { defaultNavItems } from "@/lib/config/navigation";
import { useRoleAccess } from "@/hooks/useRoleAccess";

// Storage keys
export const ACTIVE_TABS_KEY = "dashboard-active-tabs";
export const ACTIVE_TAB_KEY = "dashboard-active-tab";

// Optimized storage operations with error boundaries
const storageManager = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      consolePino.error(
        { err: error },
        `Error reading from localStorage: ${key}`,
      );

      return null;
    }
  },

  set: (key: string, value: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(key, value);

      return true;
    } catch (error) {
      consolePino.error(
        { err: error },
        `Error writing to localStorage: ${key}`,
      );

      return false;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(key);

      return true;
    } catch (error) {
      consolePino.error(
        { err: error },
        `Error removing from localStorage: ${key}`,
      );

      return false;
    }
  },
};

export const clearTabState = () => {
  storageManager.remove(ACTIVE_TABS_KEY);
  storageManager.remove(ACTIVE_TAB_KEY);
};

// Memoized icon map - dibuat di luar component untuk menghindari re-creation
const ICON_MAP: { [key: string]: React.ReactElement } = {
  dashboard: <LuLayoutDashboard />,
  wrench: <FiTool />,
  package: <FiPackage />,
  barChart: <FiBarChart2 />,
  users: <FiUsers />,
  settings: <FiSettings />,
  shield: <FiShield />,
  clock: <FiClock />,
  fileInput: <LuFileText />,
  luList: <LuList />,
  ListAll: <LuFileType2 />,
  fingerprint: <LuFingerprint />,
};

function UIDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tab States
  const [activeTabs, setActiveTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Navigation States
  const [pendingNavigation, setPendingNavigation] = useState<{
    path: string;
    tabId: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Refs untuk optimization
  const isNavigatingRef = useRef(false);
  const lastPathnameRef = useRef(pathname);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Ambil role access dengan loading state
  const { roleAccess, loading: loadingRoleAccess } = useRoleAccess();
  const userRole = session?.user?.role;

  // Helper functions untuk icon mapping
  const mapChildrenIcon = useCallback((children: readonly any[]) => {
    return Array.from(children ?? []).map((child) => ({
      ...child,
      icon: ICON_MAP[child.icon] || <FiSettings />,
    }));
  }, []);

  const attachIcon = useCallback(
    (item: any) => ({
      ...item,
      icon: ICON_MAP[item.icon] || <FiSettings />,
    }),
    [],
  );

  // Optimized navItems computation
  const navItems = useMemo(() => {
    if (!userRole || loadingRoleAccess) return [];

    // Helper untuk check access
    const hasAccess = (menuId: string) => {
      const hasAPIAccess = roleAccess.some(
        (access) => access.menu === menuId && access.role === userRole,
      );

      if (hasAPIAccess) return true;

      const menuConfig =
        defaultNavItems.find((nav) => nav.id === menuId) ||
        defaultNavItems
          .flatMap((nav) => ("children" in nav ? nav.children || [] : []))
          .find((child) => child.id === menuId);

      return menuConfig && "defaultRoles" in menuConfig
        ? (menuConfig as any).defaultRoles.includes(userRole)
        : false;
    };

    // Super admin mendapat akses penuh
    if (userRole === "super_admin") {
      return defaultNavItems.map((item) => {
        const baseItem = {
          ...item,
          icon: ICON_MAP[item.icon] || <FiSettings />,
        };

        if ("children" in item && item.children) {
          return {
            ...baseItem,
            children: mapChildrenIcon(item.children),
          };
        }

        return baseItem;
      });
    }

    // Filter untuk role lain
    return defaultNavItems
      .map((item) => {
        const hasParentAccess = hasAccess(item.id);

        if ("children" in item && item.children) {
          const accessibleChildren = item.children
            .filter((child) => hasAccess(child.id))
            .map((child) => ({
              ...child,
              icon: ICON_MAP[child.icon] || <FiSettings />,
            }));

          if (accessibleChildren.length > 0) {
            return {
              ...item,
              icon: ICON_MAP[item.icon] || <FiSettings />,
              children: accessibleChildren,
            };
          }

          if (hasParentAccess) {
            return {
              ...item,
              icon: ICON_MAP[item.icon] || <FiSettings />,
              children: undefined,
            };
          }

          return null;
        }

        if (hasParentAccess) {
          return {
            ...item,
            icon: ICON_MAP[item.icon] || <FiSettings />,
          };
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [userRole, roleAccess, loadingRoleAccess, mapChildrenIcon]);

  // Optimized getMatchedItem dengan early returns
  const getMatchedItem = useCallback(
    (path: string) => {
      // Direct match di parent
      let match = navItems.find((item) => "path" in item && item.path === path);

      if (match) return match;

      // Direct match di children
      for (const item of navItems) {
        if ("children" in item && item.children) {
          const childMatch = item.children.find((child) => child.path === path);

          if (childMatch) return childMatch;
        }
      }

      // Prefix match (exclude dashboard untuk specificity)
      match = navItems.find(
        (item) =>
          "path" in item &&
          item.path &&
          path.startsWith(item.path) &&
          item.path !== "/dashboard",
      );
      if (match) return match;

      // Prefix match di children
      for (const item of navItems) {
        if ("children" in item && item.children) {
          const childPrefix = item.children.find(
            (child) => child.path && path.startsWith(child.path),
          );

          if (childPrefix) return childPrefix;
        }
      }

      // Dashboard fallback
      if (path.startsWith("/dashboard")) {
        return navItems.find((item) => item.id === "dashboard");
      }

      return null;
    },
    [navItems],
  );

  // Debounced storage save untuk mengurangi I/O
  const saveTabsToStorage = useCallback(
    (tabs: any[], currentActiveTab: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const tabsForStorage = tabs.map(({ icon: _icon, ...tab }) => tab);

        storageManager.set(ACTIVE_TABS_KEY, JSON.stringify(tabsForStorage));
        storageManager.set(ACTIVE_TAB_KEY, currentActiveTab);
      }, 100);
    },
    [],
  );

  // Optimized loadTabsFromStorage
  const loadTabsFromStorage = useCallback(() => {
    const savedTabs = storageManager.get(ACTIVE_TABS_KEY);
    const savedActiveTab = storageManager.get(ACTIVE_TAB_KEY);

    if (!savedTabs || !savedActiveTab) return null;

    try {
      const parsedTabs = JSON.parse(savedTabs);
      const validTabs = parsedTabs
        .map((tab: any) => {
          // Cari di parent
          let navItem = navItems.find((item) => item.id === tab.id);

          // Cari di children jika tidak ditemukan
          if (!navItem) {
            for (const parent of navItems) {
              if ("children" in parent && parent.children) {
                const child = parent.children.find((c: any) => c.id === tab.id);

                if (child) {
                  navItem = child;
                  break;
                }
              }
            }
          }

          return navItem || null;
        })
        .filter(Boolean);

      if (validTabs.length === 0) return null;

      const isValidActiveTab = validTabs.some(
        (tab: any) => tab.id === savedActiveTab,
      );

      return {
        tabs: validTabs,
        activeTab: isValidActiveTab ? savedActiveTab : validTabs[0].id,
      };
    } catch (error) {
      consolePino.error({ err: error }, "Error parsing tabs from storage");

      return null;
    }
  }, [navItems]);

  // Session & Access Control Effect
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");

      return;
    }

    // Super admin bypass
    if (userRole === "super_admin") return;

    // Root dashboard selalu aman
    if (pathname === "/dashboard" || pathname === "/dashboard/") return;

    // Wait for navItems
    if (loadingRoleAccess || navItems.length === 0) return;

    // Check access
    const pathAllowed = navItems.some((item) => {
      if ("path" in item && item.path) {
        if (pathname === item.path || pathname.startsWith(item.path + "/")) {
          return true;
        }
      }
      if ("children" in item && item.children) {
        return item.children.some(
          (child) =>
            child.path &&
            (pathname === child.path || pathname.startsWith(child.path + "/")),
        );
      }

      return false;
    });

    if (!pathAllowed) {
      consolePino.warn(
        `Access denied for role ${userRole} to path ${pathname}`,
      );
      router.replace("/dashboard");
    }
  }, [
    status,
    session,
    router,
    pathname,
    navItems,
    loadingRoleAccess,
    userRole,
  ]);

  // Tab Initialization Effect
  useEffect(() => {
    if (
      status === "loading" ||
      !session ||
      navItems.length === 0 ||
      isInitialized
    ) {
      return;
    }

    const currentMatchedItem = getMatchedItem(pathname);
    const savedData = loadTabsFromStorage();

    if (savedData) {
      const currentPathTab = getMatchedItem(pathname);

      if (currentPathTab && currentPathTab.id !== savedData.activeTab) {
        setActiveTab(currentPathTab.id);
        setActiveTabs((prev) => {
          const tabExists = savedData.tabs.some(
            (tab: any) => tab.id === currentPathTab.id,
          );
          const newTabs = tabExists
            ? savedData.tabs
            : [currentPathTab, ...savedData.tabs];

          saveTabsToStorage(newTabs, currentPathTab.id);

          return newTabs;
        });
      } else {
        setActiveTabs(savedData.tabs);
        setActiveTab(savedData.activeTab);
      }
    } else if (currentMatchedItem) {
      setActiveTabs([currentMatchedItem]);
      setActiveTab(currentMatchedItem.id);
      saveTabsToStorage([currentMatchedItem], currentMatchedItem.id);
    } else {
      const dashboardTab = navItems.find((item) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab]);
        setActiveTab(dashboardTab.id);
        saveTabsToStorage([dashboardTab], dashboardTab.id);
      }
    }

    setIsInitialized(true);
  }, [
    status,
    session,
    navItems,
    pathname,
    getMatchedItem,
    loadTabsFromStorage,
    saveTabsToStorage,
    isInitialized,
  ]);

  // Pathname Sync Effect
  useEffect(() => {
    if (
      !isInitialized ||
      isNavigatingRef.current ||
      lastPathnameRef.current === pathname
    ) {
      return;
    }

    lastPathnameRef.current = pathname;
    const currentMatchedItem = getMatchedItem(pathname);

    if (!currentMatchedItem) return;

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
      }

      const newTabs = [currentMatchedItem, ...prevTabs];

      setActiveTab(currentMatchedItem.id);
      saveTabsToStorage(newTabs, currentMatchedItem.id);

      return newTabs;
    });
  }, [pathname, isInitialized, getMatchedItem, saveTabsToStorage, activeTab]);

  // Pending Navigation Effect
  useEffect(() => {
    if (!pendingNavigation) return;

    isNavigatingRef.current = true;
    startTransition(() => {
      router.push(pendingNavigation.path);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    });

    setPendingNavigation(null);
  }, [pendingNavigation, router]);

  // Tab Handlers
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
        const newTabs = existingTab ? prevTabs : [tab, ...prevTabs];

        setActiveTab(tab.id);
        saveTabsToStorage(newTabs, tab.id);
        setPendingNavigation({ path: tab.path, tabId: tab.id });

        return newTabs;
      });
    },
    [activeTab, saveTabsToStorage],
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

  const handleSignOut = useCallback(() => {
    clearTabState();
    signOut();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
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

export default memo(UIDashboardLayout);
