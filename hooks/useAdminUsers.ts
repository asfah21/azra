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
    mutationFn: async ({ userId, photo }: UpdateUserPhotoPayload): Promise<UpdateUserPhotoResponse> => {
      const fd = new FormData();
      fd.append("photo", photo);
      const res = await axios.post(`/api/users/${userId}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onError: (error) => {
      consolePino.error({ err: error }, "Error updating user photo by admin");
    },
  });
}
