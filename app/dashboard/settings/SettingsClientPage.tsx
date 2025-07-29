"use client";

import { Settings } from "lucide-react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";

import ProfileSetting from "./components/ProfileSetting";
import SystemSetting from "./components/SystemSetting";

import { SettingsSkeleton } from "@/components/ui/skeleton";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      refetchOnWindowFocus: false,
    },
  },
});

interface SettingsClientPageProps {
  initialData?: {
    success: boolean;
    profile: {
      id: string;
      name: string;
      email: string;
      photo: string;
      phone: string;
      location: string;
      department: string;
      role: string;
      createdAt: string;
    };
  };
}

function SettingsClientPageContent({ initialData }: SettingsClientPageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await axios.get("/api/settings");

      return res.data;
    },
    refetchInterval: 30000,
    initialData,
  });

  const profile = data?.profile;

  return (
    <div className="p-0 md:p-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
            <Settings className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SettingsSkeleton />
      ) : isError ? (
        <div className="text-center py-10 text-red-500">
          Gagal memuat data settings.
        </div>
      ) : !data?.success || !profile ? (
        <div className="text-center py-10 text-red-500">
          Data profil tidak ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfileSetting profile={profile} />
          <SystemSetting />
        </div>
      )}
    </div>
  );
}

export default function SettingsClientPage(props: SettingsClientPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsClientPageContent {...props} />
    </QueryClientProvider>
  );
}
