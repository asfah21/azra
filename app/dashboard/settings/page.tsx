import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";
import { Metadata } from "next";

import ProfileSetting from "./components/ProfileSetting";
import SystemSetting from "./components/SystemSetting";
import { getSettingsData } from "./action";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your profile and system settings",
};

export default async function SettingsPage() {
  try {
    // Coba ambil session terlebih dahulu
    let userId: string;
    
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id || "system";
    } catch (sessionError) {
      console.warn("Session error, using fallback:", sessionError);
      userId = "system";
    }
    
    // Server-side data untuk initial load (SSR)
    const { profile, success, message } = await getSettingsData(userId);

    if (!success) {
      return (
        <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Gagal mengambil data profil</h2>
          <p>{message}</p>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Profil Tidak Ditemukan</h2>
          <p>Profil pengguna tidak dapat ditemukan.</p>
        </div>
      );
    }

    return (
      <div className="p-0 md:p-5 max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfileSetting profile={profile} userId={userId} />
          <SystemSetting />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in SettingsPage:", error);
    return (
      <div className="p-5 max-w-2xl mx-auto text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p>Gagal memuat halaman Settings.</p>
      </div>
    );
  }
}
