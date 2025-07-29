// ProfileProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

type Profile = {
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

const ProfileContext = createContext<{
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}>({
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/settings");

      if (res.data?.success && res.data?.profile) {
        setProfile(res.data.profile);
      } else {
        console.warn("No profile found in response");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
