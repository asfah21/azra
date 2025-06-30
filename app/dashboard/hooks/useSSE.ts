"use client";

import { useEffect, useState, useRef } from "react";
import { DashboardData, RecentActivity } from "./useDashboard";

interface SSEData {
  type: "initial" | "update";
  dashboardData: DashboardData;
  recentActivities: RecentActivity[];
}

interface SSEError {
  error: string;
}

export function useSSE() {
  const [data, setData] = useState<{
    dashboardData: DashboardData;
    recentActivities: RecentActivity[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource("/api/dashboard/sse");
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log("SSE connection established");
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const parsedData: SSEData | SSEError = JSON.parse(event.data);
            
            if ("error" in parsedData) {
              setError(parsedData.error);
              return;
            }

            if (parsedData.type === "initial" || parsedData.type === "update") {
              // Konversi string dates ke Date objects untuk recent activities
              const processedData = {
                dashboardData: parsedData.dashboardData,
                recentActivities: parsedData.recentActivities.map((activity) => ({
                  ...activity,
                  createdAt: new Date(activity.createdAt),
                })),
              };

              setData(processedData);
              setIsLoading(false);
            }
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
            setError("Failed to parse data");
          }
        };

        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          setError("Connection error");
          eventSource.close();
          
          // Reconnect setelah 5 detik
          setTimeout(() => {
            if (eventSourceRef.current === eventSource) {
              connectSSE();
            }
          }, 5000);
        };

      } catch (error) {
        console.error("Error creating SSE connection:", error);
        setError("Failed to connect");
      }
    };

    connectSSE();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    dashboardData: data?.dashboardData || {
      assetStats: { total: 0, active: 0, maintenance: 0, critical: 0 },
      workOrderStats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        rfu: 0,
        overdue: 0,
      },
      monthlyBreakdowns: [],
      categoryDistribution: [],
      maintenancePerformance: [],
    },
    recentActivities: data?.recentActivities || [],
    isLoading,
    error,
  };
} 