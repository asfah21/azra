"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FiLogOut,
  FiUser,
  FiHome,
  FiSettings,
  FiActivity,
} from "react-icons/fi";

export default function UIDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">TailAdmin</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                className="flex items-center p-3 text-white bg-blue-600 rounded-lg"
                href="/dashboard"
              >
                <FiHome className="mr-3" />
                Dashboard
              </a>
            </li>
            <li>
              <a
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                href="/profile"
              >
                <FiUser className="mr-3" />
                Profile
              </a>
            </li>
            <li>
              <a
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                href="/analytics"
              >
                <FiActivity className="mr-3" />
                Analytics
              </a>
            </li>
            <li>
              <a
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                href="/setting"
              >
                <FiSettings className="mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
