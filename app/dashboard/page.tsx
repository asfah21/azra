"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleTestApi = async () => {
    try {
      const response = await fetch("/api/data");
      const data = await response.json();

      if (process.env.NODE_ENV === "development") {
        console.log("API Response:", data);
      }

      alert("API call successful");
    } catch (error) {
      console.error("API Error:", error);
      alert("API Error occurred");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Logout
        </button>
      </header>

      {/* User Profile Section */}
      <section className="bg-gray-50 p-5 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome, {user.name || user.email}!
        </h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="bg-white p-5 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Dashboard Content</h3>
        <p className="mb-4">
          This is your protected dashboard area. You can add your application
          content here.
        </p>

        {/* API Test Button */}
        <button
          className="px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleTestApi}
        >
          Test API Call
        </button>
      </section>
    </div>
  );
}
