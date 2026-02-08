// filepath: d:\PAM-PROJECT\azra\hooks\useAdminUsers.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { consolePino } from "@/lib/logger";

interface UpdateUserPhotoPayload {
  userId: string;
  photo: File;
}

interface UpdateUserPhotoResponse {
  success: boolean;
  message?: string;
  photoUrl?: string;
}

export function useUpdateUserPhoto() {
  return useMutation({
    mutationFn: async ({
      userId,
      photo,
    }: UpdateUserPhotoPayload): Promise<UpdateUserPhotoResponse> => {
      try {
        const fd = new FormData();

        fd.append("photo", photo);

        consolePino.info("Uploading photo", {
          userId,
          fileName: photo.name,
          fileSize: photo.size,
          fileType: photo.type,
        });

        const res = await axios.post(`/api/users/${userId}/photo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 second timeout
        });

        consolePino.info("Upload response", { data: res.data });

        return res.data;
      } catch (error: any) {
        consolePino.error("Upload failed", {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
        });

        // Re-throw with better error message
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to upload photo",
        );
      }
    },
    onError: (error) => {
      consolePino.error({ err: error }, "Error updating user photo by admin");
    },
  });
}
