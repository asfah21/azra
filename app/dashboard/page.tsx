"use client";

import { useSession } from "next-auth/react";
import { FiActivity, FiUser, FiSettings } from "react-icons/fi";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

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

  return (
    <>
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome back, {user.name || user.email}!
            </h2>
            <p className="text-gray-600">Here is your account today.</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <FiUser className="text-blue-600 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiUser className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FiActivity className="text-green-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-800 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiSettings className="text-purple-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium text-gray-800">{user.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Dashboard Overview
          </h3>
          <div className="flex space-x-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              onClick={handleTestApi}
            >
              <FiActivity className="mr-2" />
              Test API Call
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-600 mb-4">
            This is your protected dashboard area. You can add your application
            content here. Below is an example of a responsive data table.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Email
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Role
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    scope="col"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
