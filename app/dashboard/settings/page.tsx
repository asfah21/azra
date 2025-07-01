import { Settings } from "lucide-react";
import { getServerSession } from "next-auth";

import ProfileSetting from "./components/ProfileSetting";
import { getProfile } from "./action";
import SystemSetting from "./components/SystemSetting";

import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id; // Ambil userId dari session

  if (!userId) {
    // Jika userId tidak ada (belum login), bisa redirect atau tampilkan pesan error
    return <div>Anda harus login untuk mengakses halaman ini.</div>;
  }

  const profile = await getProfile(userId);

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
        {/* <SaveButton />         */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileSetting profile={profile} userId={userId} />
        {/* <QuickSettingCard /> */}
        {/* <NotificationSetting /> */}
        <SystemSetting />
      </div>
    </div>
  );
}
