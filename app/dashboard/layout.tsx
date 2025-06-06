import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `Dashboard - ${siteConfig.name}`,
    template: `%s - Dashboard - ${siteConfig.name}`,
  },
};

export default function DashboardLayout({children}: { children: React.ReactNode;}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* This layout will completely override the main layout structure */}
      {children}
    </div>
  );
}