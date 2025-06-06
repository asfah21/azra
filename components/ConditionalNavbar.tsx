"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard"); // Adjust this condition based on your dashboard route

  return !isDashboard && <Navbar />;
}
