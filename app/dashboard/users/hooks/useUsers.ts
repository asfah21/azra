"use client";

import useSWR from "swr";

import { UserPayload, UserStats } from "../types";

// Helper function untuk konversi data
const convertUserData = (user: any): UserPayload => ({
  ...user,
  createdAt: new Date(user.createdAt),
  lastActive: user.lastActive ? new Date(user.lastActive) : null,
});

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();

  // Konversi string dates ke Date objects
  if (data.users) {
    data.users = data.users.map(convertUserData);
  }

  return data;
};

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<{
    users: UserPayload[];
    stats: UserStats;
  }>("/api/users", fetcher, {
    refreshInterval: 10000, // Refresh setiap 10 detik
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    users: data?.users || [],
    stats: data?.stats || {
      total: 0,
      new: 0,
      active: 0,
      inactive: 0,
    },
    isLoading,
    error,
    mutate,
  };
}

// Export helper function untuk digunakan di optimistic actions
export { convertUserData };
