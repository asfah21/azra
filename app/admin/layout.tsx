import { Metadata } from "next";

import UIAdminLayout from "@/components/ui/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing users and settings.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UIAdminLayout>{children}</UIAdminLayout>;
}
