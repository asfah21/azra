export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "AZRA - PT GSI",
  description:
    "Discover AZRA a stunning asset management apps designed for simplicity.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "User WO",
      href: "/userwo",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "User WO",
      href: "/userwo",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    login: "/login",
    formine: "https://gsi.db-ku.com",
  },
};
