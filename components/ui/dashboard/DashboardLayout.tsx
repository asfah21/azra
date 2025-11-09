"use client";

import type { SidebarNavItem, SidebarNavChild } from "./Sidebar";

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
import {
  FiSettings,
  FiPackage,
  FiBarChart2,
  FiUsers,
  FiShield,
  FiClock,
  FiTool,
  FiFile,
  FiFileText,
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
import { Newspaper } from "lucide-react";

// Key untuk localStorage
export const ACTIVE_TABS_KEY = "dashboard-active-tabs";
export const ACTIVE_TAB_KEY = "dashboard-active-tab";

// Function to clear tab state from localStorage
export const clearTabState = () => {
  try {
    localStorage.removeItem(ACTIVE_TABS_KEY);
    localStorage.removeItem(ACTIVE_TAB_KEY);
  } catch (error) {
    consolePino.error({ err: error }, "Error clearing tab state");
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

  //ubah icon sidebar disini
  const iconMap: { [key: string]: React.ReactElement } = {
    dashboard: <LuLayoutDashboard />,
    wrench: <FiTool />,
    package: <FiFileText />,
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

  const navItems = useMemo(() => {
    const userRole = session?.user?.role;
    if (!userRole) return [];

    const mapChildrenIcon = (children: readonly SidebarNavChild[] = []) =>
      children.map((child) => ({
        ...child,
        icon: iconMap[child.icon as string] || <FiSettings />,
      }));

    if (userRole === "super_admin") {
      return defaultNavItems.map((item) => {
        let children: SidebarNavChild[] | undefined;
        if ("children" in item && item.children) {
          children = mapChildrenIcon(item.children as SidebarNavChild[]);
        }
        return {
          ...item,
          icon: iconMap[item.icon as string] || <FiSettings />,
          children,
        } as SidebarNavItem;
      });
    }

    const hasAccess = (menuId: string) => {
      if (userRole === "super_admin") return true;
      const menuConfig =
        (defaultNavItems.find((nav) => nav.id === menuId) as any) ||
        defaultNavItems
          .flatMap((nav: any) => ("children" in nav ? nav.children || [] : []))
          .find((child: any) => child.id === menuId);
      if (menuConfig && "defaultRoles" in menuConfig) {
        return menuConfig.defaultRoles?.includes(userRole);
      }
      return false;
    };

    return defaultNavItems
      .map((item: any) => {
        const parentAccess = hasAccess(item.id);
        if ("children" in item && item.children?.length) {
          const accessibleChildren = (item.children as SidebarNavChild[]).filter((child) => hasAccess(child.id));
          if (accessibleChildren.length) {
            return {
              ...item,
              icon: iconMap[item.icon as string] || <FiSettings />,
              children: accessibleChildren.map((child) => ({
                ...child,
                icon: iconMap[child.icon as string] || <FiSettings />,
              })),
            };
          }
          if (parentAccess) {
            return {
              ...item,
              icon: iconMap[item.icon as string] || <FiSettings />,
              children: undefined,
            };
          }
          return null;
        }
        if (parentAccess) {
          return {
            ...item,
            icon: iconMap[item.icon as string] || <FiSettings />,
          };
        }
        return null;
      })
      .filter(Boolean) as (SidebarNavItem | SidebarNavChild)[];
  }, [session?.user?.role]);

  // Optimized pathname matcher
  const getMatchedItem = useCallback(
    (path: string) => {
      // Direct match first (most common case)
      let directMatch: SidebarNavItem | SidebarNavChild | undefined =
        navItems.find((item: any) => "path" in item && item.path === path);

      if (!directMatch) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childMatch = (item.children as SidebarNavChild[]).find(
              (child) => child.path === path,
            );
            if (childMatch) {
              directMatch = childMatch;
              break;
            }
          }
        }
      }
      if (directMatch) return directMatch;

      // Prefix match (excluding dashboard for specificity)
      let prefixMatch: SidebarNavItem | SidebarNavChild | undefined = navItems.find(
        (item: any) =>
          "path" in item && item.path && path.startsWith(item.path) && item.path !== "/dashboard",
      );

      if (!prefixMatch) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childPrefix = (item.children as SidebarNavChild[]).find(
              (child) => child.path && path.startsWith(child.path!),
            );
            if (childPrefix) {
              prefixMatch = childPrefix;
              break;
            }
          }
        }
      }
      if (prefixMatch) return prefixMatch;

      // Dashboard fallback for any /dashboard/* path
      if (path.startsWith("/dashboard")) {
        return navItems.find((item: any) => item.id === "dashboard") || null;
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
          consolePino.error({ err: error }, "Error saving tabs to storage");
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
            // Cari di parent
            let navItem = navItems.find((item) => item.id === tab.id);

            if (!navItem) {
              // Cari di children
              for (const parent of navItems) {
                if ("children" in parent && parent.children) {
                  const child = (parent.children as SidebarNavChild[]).find(
                    (c: any) => c.id === tab.id,
                  );

                  if (child) {
                    navItem = child;
                    break;
                  }
                }
              }
            }

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
      consolePino.error({ err: error }, "Error loading tabs from storage");
    }

    return null;
  }, [navItems]);

  // Handle session redirect & dynamic access (berdasarkan hasil filtering navItems)
  useEffect(() => {
    console.log("🔍 DEBUG: Access check triggered", {
      status,
      pathname,
      userRole: session?.user?.role,
      navItemsLength: navItems.length,
    });

    if (status === "loading") return;
    if (!session) {
      console.log("❌ No session, redirecting to login");
      router.push("/login");

      return;
    }

    // super_admin bebas
    if (session.user?.role === "super_admin") {
      console.log("✅ Super admin access granted");

      return;
    }

    // Root dashboard selalu aman
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      console.log("✅ Dashboard root access granted");

      return;
    }

    // Temporary: Allow timesheet access for debugging
    if (pathname.startsWith("/dashboard/timentry")) {
      console.log("✅ Temporary timesheet access granted for debugging");

      return;
    }

    // Wait for navItems to be loaded before checking access
    if (navItems.length === 0) {
      console.log("⏳ Waiting for role access data to load...");

      return;
    }

    // Jika path sekarang tidak ada di navItems yang difilter => tidak punya akses
    const pathAllowed = navItems.some((item: any) => {
      if (
        "path" in item &&
        item.path &&
        (pathname === item.path || pathname.startsWith(item.path + "/"))
      ) {
        return true;
      }
      if ("children" in item && item.children) {
        return (item.children as SidebarNavChild[]).some(
          (child) =>
            child.path &&
            (pathname === child.path || pathname.startsWith(child.path + "/")),
        );
      }

      return false;
    });

    console.log("🔐 Path access check:", {
      pathname,
      pathAllowed,
      availableNavItems: navItems.map((item) => ({
        id: item.id,
        title: item.title,
        path: "path" in item ? item.path : "no-path",
        children:
          "children" in item
            ? item.children?.map((c: SidebarNavChild) => ({ id: c.id, path: c.path }))
            : "no-children",
      })),
    });

    if (!pathAllowed) {
      console.error(
        `❌ Access denied for user role ${session.user?.role} to path ${pathname}`,
      );
      consolePino.warn(
        `Access denied for user role ${session.user?.role} to path ${pathname}. Available paths:`,
        navItems.map((item) =>
          "path" in item ? item.path : `${item.title} (parent menu)`,
        ),
      );
      router.replace("/dashboard");
    }
  }, [status, session, router, pathname, navItems]);

  // Single initialization effect
  useEffect(() => {
    if (status === "loading" || !session || navItems.length === 0) return;

    const currentMatchedItem = getMatchedItem(pathname);
    const savedData = loadTabsFromStorage();

    console.log("🔄 Tab initialization:", {
      pathname,
      currentMatchedItem: currentMatchedItem?.id,
      savedActiveTab: savedData?.activeTab,
      savedTabsCount: savedData?.tabs?.length || 0,
    });

    if (savedData) {
      // Check if current path matches the active tab
      const savedActiveTab = navItems.find(
        (item: any) => item.id === savedData.activeTab,
      );
      let currentPathTab: SidebarNavItem | SidebarNavChild | undefined = navItems.find(
        (item: any) => "path" in item && item.path === pathname,
      );

      if (!currentPathTab) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childTab = (item.children as SidebarNavChild[]).find(
              (child) => child.path === pathname,
            );
            if (childTab) {
              currentPathTab = childTab;
              break;
            }
          }
        }
      }

      if (
        currentPathTab &&
        (!savedActiveTab || currentPathTab.id !== savedData.activeTab)
      ) {
        // If current path doesn't match saved active tab, add current tab to existing tabs
        setActiveTab(currentPathTab.id);
        setActiveTabs((prevTabs) => {
          // Start with saved tabs, then add current tab if not exists
          const savedTabsWithIcons = savedData.tabs
            .map((tab: any) => {
              // Re-attach icons for saved tabs
              let fullNavItem: SidebarNavItem | SidebarNavChild | undefined = navItems.find((item: any) => item.id === tab.id);

              if (!fullNavItem) {
                for (const parent of navItems) {
                  if ("children" in parent && parent.children) {
                    const child = (parent.children as SidebarNavChild[]).find((c) => c.id === tab.id);
                    if (child) { fullNavItem = child; break; }
                  }
                }
              }

              return fullNavItem || tab;
            })
            .filter(Boolean);

          const tabExists = savedTabsWithIcons.some(
            (tab: any) => tab.id === currentPathTab!.id,
          );
          const newTabs = tabExists ? savedTabsWithIcons : [currentPathTab, ...savedTabsWithIcons];

          saveTabsToStorage(newTabs as any[], currentPathTab!.id);

          return newTabs as any[];
        });
      } else {
        // Use saved data - current path matches saved active tab
        setActiveTabs(() => {
          // Re-attach icons to saved tabs
          const tabsWithIcons = savedData.tabs
            .map((tab: any) => {
              let fullNavItem: SidebarNavItem | SidebarNavChild | undefined = navItems.find((item: any) => item.id === tab.id);

              if (!fullNavItem) {
                for (const parent of navItems) {
                  if ("children" in parent && parent.children) {
                    const child = (parent.children as SidebarNavChild[]).find((c) => c.id === tab.id);
                    if (child) { fullNavItem = child; break; }
                  }
                }
              }

              return fullNavItem || tab;
            })
            .filter(Boolean);

          return tabsWithIcons as any[];
        });
        setActiveTab(savedData.activeTab);
      }
    } else if (currentMatchedItem) {
      // No saved data, initialize with current path
      setActiveTabs([currentMatchedItem] as any[]);
      setActiveTab(currentMatchedItem.id);
      saveTabsToStorage([currentMatchedItem] as any[], currentMatchedItem.id);
    } else {
      // Fallback to dashboard
      const dashboardTab = navItems.find((item: any) => item.id === "dashboard");

      if (dashboardTab) {
        setActiveTabs([dashboardTab] as any[]);
        setActiveTab(dashboardTab.id);
        saveTabsToStorage([dashboardTab] as any[], dashboardTab.id);
      }
    }

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
          // Jangan hapus tab lain, hanya tambahkan tab baru di belakang
          const newTabs = [currentMatchedItem, ...prevTabs];

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

  // Handle sign out with tab state cleanup
  const handleSignOut = useCallback(() => {
    clearTabState();
    // signOut({ callbackUrl: "/" });
    signOut();
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
