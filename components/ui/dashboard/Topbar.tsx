"use client";

import { FiBell, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { FiXCircle } from "react-icons/fi";

import { ThemeSwitch } from "@/components/theme-switch";
import { Logo, SearchIcon } from "@/components/icons";

interface TopbarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeTabs: any[];
  activeTab: string;
  handleTabClick: (tab: any) => void;
  closeTab: (tabId: string, e: React.MouseEvent) => void;
  signOut: () => void;
  navItems: any[];
  openNewTab: (tab: any) => void;
}

export function Topbar({
  menuOpen,
  setMenuOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTabs,
  activeTab,
  handleTabClick,
  closeTab,
  signOut,
  navItems,
  openNewTab,
}: TopbarProps) {
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

  return (
    <>
      {/* Mobile Topbar */}
      <header className="w-full md:hidden bg-content1 shadow-small p-4 flex justify-between items-center border-b border-divider relative">
        <Button
          isIconOnly
          className="touch-manipulation"
          variant="light"
          onPress={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              <Logo />
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">AZRA</h1>
        </div>

        <Button isIconOnly variant="light">
          <ThemeSwitch />
          {/* <FiBell size={18} /> */}
        </Button>
      </header>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <Card className="md:hidden absolute top-16 left-0 right-0 z-[9999] shadow-large rounded-none">
          <CardBody className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <Button
                  key={item.id}
                  className="w-full justify-start h-12 touch-manipulation"
                  color={isActive ? "primary" : "default"}
                  startContent={<span className="text-lg">{item.icon}</span>}
                  variant={isActive ? "flat" : "light"}
                  onPress={() => {
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

      {/* Desktop Topbar */}
      <header className="hidden md:flex justify-between items-center bg-content1 px-6 py-4 shadow-small border-b border-divider">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="bordered"
            onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span className="text-gray-500">
              {sidebarCollapsed ? (
                <GoSidebarCollapse size={18} />
              ) : (
                <GoSidebarExpand size={18} />
              )}
            </span>
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
            onClick={signOut}
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
                      e.stopPropagation();
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
    </>
  );
}
