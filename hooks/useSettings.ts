import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Profile {
  id: string;
  name: string;
  email: string;
  photo: string;
  phone: string;
  location: string;
  department: string;
  role: string;
  createdAt: string;
}

interface SettingsResponse {
  success: boolean;
  profile: Profile;
  message?: string;
  photoUrl?: string; // Tambahkan ini
}

interface UpdateProfileData {
  phone: string;
}

interface UpdatePhotoData {
  photo: File;
}

// Fetch settings data
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<SettingsResponse> => {
      const response = await axios.get("/api/settings");

      return response.data;
    },
    refetchInterval: 30000, // Polling setiap 30 detik
    refetchIntervalInBackground: true,
    staleTime: 10000, // Data dianggap fresh selama 10 detik
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<SettingsResponse> => {
      const response = await axios.put("/api/settings", data);

      return response.data;
    },
    onSuccess: (data) => {
      // Update cache dengan data terbaru
      queryClient.setQueryData(["settings"], data);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    },
  });
};

// Update photo mutation
export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePhotoData): Promise<SettingsResponse> => {
      const formData = new FormData();

      formData.append("photo", data.photo);

      const response = await axios.post("/api/settings/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      // Update cache dengan data terbaru (bertanggung jawab atas pembaruan photo otomatis)
      queryClient.setQueryData(["settings"], data);
    },
    onError: (error) => {
      console.error("Error updating photo:", error);
    },
  });
};
