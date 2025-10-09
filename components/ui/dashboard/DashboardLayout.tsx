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
} from "react-icons/fi";
import {
  LuFileText,
  LuFileType2,
  LuLayoutDashboard,
  LuList,
} from "react-icons/lu";

import { LoadingSpinner } from "../skeleton";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

import { consolePino } from "@/lib/logger";
import { defaultNavItems } from "@/lib/config/navigation";
import { useRoleAccess } from "@/hooks/useRoleAccess";

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
    package: <FiPackage />,
    barChart: <FiBarChart2 />,
    users: <FiUsers />,
    settings: <FiSettings />,
    shield: <FiShield />,
    clock: <FiClock />,
    fileInput: <LuFileText />,
    luList: <LuList />,
    ListAll: <LuFileType2 />,
  };

  // Ambil role access dari backend
  const { roleAccess, loading: loadingRoleAccess } = useRoleAccess();

  const navItems = useMemo(() => {
    const userRole = session?.user?.role;

    if (!userRole || loadingRoleAccess) {
      return [];
    }

    // Helper untuk konversi icon pada children
    const mapChildrenIcon = (children: readonly any[]) =>
      Array.from(children ?? []).map((child) => ({
        ...child,
        icon: iconMap[child.icon] || <FiSettings />,
      }));

    // Jika user adalah super_admin, kembalikan semua menu (akses penuh)
    if (userRole === "super_admin") {
      return defaultNavItems.map((item) => {
        let children;

        if ("children" in item && item.children) {
          children = mapChildrenIcon(item.children);
        }

        return {
          ...item,
          icon: iconMap[item.icon] || <FiSettings />,
          children,
        };
      });
    }

    // Untuk role lain, filter menu berdasarkan hasil API role access
    const filteredItems = defaultNavItems
      .map((item) => {
        // Helper function to check user access
        const hasAccess = (menuId: string) => {
          // Check from roleAccess API data first
          const hasAPIAccess = roleAccess.some(
            (access) => access.menu === menuId && access.role === userRole,
          );

          if (hasAPIAccess) return true;

          // Fallback to defaultRoles if no API configuration
          const menuConfig =
            defaultNavItems.find((nav) => nav.id === menuId) ||
            defaultNavItems
              .flatMap((nav) => ("children" in nav ? nav.children || [] : []))
              .find((child) => child.id === menuId);

          if (menuConfig && "defaultRoles" in menuConfig) {
            return (menuConfig as any).defaultRoles.includes(userRole);
          }

          return false;
        };

        // Check if user has access to this menu item
        const hasParentAccess = hasAccess(item.id);

        // For parent menus with children
        if ("children" in item && item.children) {
          const accessibleChildren = item.children.filter((child) =>
            hasAccess(child.id),
          );

          // If user has access to any children, include the parent
          if (accessibleChildren.length > 0) {
            return {
              ...item,
              icon: iconMap[item.icon] || <FiSettings />,
              children: accessibleChildren.map((child) => ({
                ...child,
                icon: iconMap[child.icon] || <FiSettings />,
              })),
            };
          }

          // If parent has direct access but no accessible children, include without children
          if (hasParentAccess) {
            return {
              ...item,
              icon: iconMap[item.icon] || <FiSettings />,
              children: undefined,
            };
          }

          return null; // No access to parent or children
        }

        // For regular menu items with direct path
        if (hasParentAccess) {
          return {
            ...item,
            icon: iconMap[item.icon] || <FiSettings />,
          };
        }

        return null; // No access
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return filteredItems;
  }, [session?.user?.role, roleAccess, loadingRoleAccess]);

  // Optimized pathname matcher
  const getMatchedItem = useCallback(
    (path: string) => {
      // Direct match first (most common case)
      let directMatch: SidebarNavItem | SidebarNavChild | undefined =
        navItems.find((item) => "path" in item && item.path === path);

      if (!directMatch) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childMatch = item.children.find(
              (child) => child.path === path,
            );

            if (childMatch) {
              directMatch = {
                ...childMatch,
                icon: iconMap[childMatch.icon as string] || <FiSettings />,
              };
              break;
            }
          }
        }
      }
      if (!directMatch) {
        // Cari pada children jika parent tidak punya path
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childMatch = item.children.find(
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
      let prefixMatch: SidebarNavItem | SidebarNavChild | undefined =
        navItems.find(
          (item) =>
            "path" in item &&
            item.path &&
            path.startsWith(item.path) &&
            item.path !== "/dashboard",
        );

      if (!prefixMatch) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childPrefix = item.children.find(
              (child) => child.path && path.startsWith(child.path),
            );

            if (childPrefix) {
              prefixMatch = {
                ...childPrefix,
                icon: iconMap[childPrefix.icon as string] || <FiSettings />,
              };
              break;
            }
          }
        }
      }
      if (!prefixMatch) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childPrefix = item.children.find(
              (child: any) => child.path && path.startsWith(child.path),
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
                  const child = parent.children.find(
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
      loadingRoleAccess,
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
    if (loadingRoleAccess || navItems.length === 0) {
      console.log("⏳ Waiting for role access data to load...");

      return;
    }

    // Jika path sekarang tidak ada di navItems yang difilter => tidak punya akses
    const pathAllowed = navItems.some((item) => {
      if (
        "path" in item &&
        item.path &&
        (pathname === item.path || pathname.startsWith(item.path + "/"))
      ) {
        return true;
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

    console.log("🔐 Path access check:", {
      pathname,
      pathAllowed,
      availableNavItems: navItems.map((item) => ({
        id: item.id,
        title: item.title,
        path: "path" in item ? item.path : "no-path",
        children:
          "children" in item
            ? item.children?.map((c) => ({ id: c.id, path: c.path }))
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
  }, [status, session, router, pathname, navItems, loadingRoleAccess]);

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
        (item) => item.id === savedData.activeTab,
      );
      let currentPathTab: SidebarNavItem | SidebarNavChild | undefined =
        navItems.find((item) => "path" in item && item.path === pathname);

      if (!currentPathTab) {
        for (const item of navItems) {
          if ("children" in item && item.children) {
            const childTab = item.children.find(
              (child) => child.path === pathname,
            );

            if (childTab) {
              currentPathTab = {
                ...childTab,
                icon: iconMap[childTab.icon as string] || <FiSettings />,
              };
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
              let fullNavItem = navItems.find((item) => item.id === tab.id);

              if (!fullNavItem) {
                for (const parent of navItems) {
                  if ("children" in parent && parent.children) {
                    const child = parent.children.find(
                      (c: any) => c.id === tab.id,
                    );

                    if (child) {
                      fullNavItem = child;
                      break;
                    }
                  }
                }
              }

              return fullNavItem || tab;
            })
            .filter(Boolean);

          const tabExists = savedTabsWithIcons.some(
            (tab: any) => tab.id === currentPathTab.id,
          );
          const newTabs = tabExists
            ? savedTabsWithIcons
            : [currentPathTab, ...savedTabsWithIcons];

          saveTabsToStorage(newTabs, currentPathTab.id);

          return newTabs;
        });
      } else {
        // Use saved data - current path matches saved active tab
        setActiveTabs(() => {
          // Re-attach icons to saved tabs
          const tabsWithIcons = savedData.tabs
            .map((tab: any) => {
              let fullNavItem = navItems.find((item) => item.id === tab.id);

              if (!fullNavItem) {
                for (const parent of navItems) {
                  if ("children" in parent && parent.children) {
                    const child = parent.children.find(
                      (c: any) => c.id === tab.id,
                    );

                    if (child) {
                      fullNavItem = child;
                      break;
                    }
                  }
                }
              }

              return fullNavItem || tab;
            })
            .filter(Boolean);

          return tabsWithIcons;
        });
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
