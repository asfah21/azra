'use client';

import { useEffect, useState } from 'react';

export default function DashboardContent({ user }: { user: any }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch data dari API route
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setDashboardData(data.dashboardData);
        setRecentActivities(data.recentActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  // Gunakan user untuk menampilkan informasi atau sebagai dependency
  return (
    <div>
      <h1>Welcome, {user?.name || 'User'}</h1>
      {/* Render dashboard content dengan dashboardData dan recentActivities */}
    </div>
  );
} 