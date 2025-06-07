import { Metadata } from "next";

import { siteConfig } from "@/config/site";
import UIDashboardLayout from "@/components/ui/DashboardLayout";

export const metadata: Metadata = {
  title: {
    default: `Dashboard - ${siteConfig.name}`,
    template: `%s - Dashboard - ${siteConfig.name}`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UIDashboardLayout>{children}</UIDashboardLayout>;
}
