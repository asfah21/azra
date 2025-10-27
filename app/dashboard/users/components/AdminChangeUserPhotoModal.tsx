// filepath: d:\PAM-PROJECT\azra\app\dashboard\users\components\AdminChangeUserPhotoModal.tsx
"use client";

import { useState } from "react";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Card,
  CardBody,
  addToast,
} from "@heroui/react";
import { Image, Upload } from "lucide-react";

// Content-only for parent <Modal><ModalContent>{(onClose)=> <AdminChangeUserPhotoModal .../>}</ModalContent></Modal>
// Mirroring ChangePhotoModal behavior

interface UserLike {
  id?: string;
  name?: string;
  email?: string;
  photo?: string;
}

interface Props {
  user: UserLike | null;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export default function AdminChangeUserPhotoModal({
  user,
  onClose,
  onUpload,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 1024 * 1024) {
        setErrorMessage("Ukuran gambar terlalu besar! Maksimal 1MB.");
        setSelectedFile(null);
        setPreview(null);
        e.target.value = "";

        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      const reader = new FileReader();

      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      handleClose();
    } catch (e) {
      addToast({
        title: "Gagal mengupload foto",
        description: "Terjadi kesalahan saat mengupload foto.",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setIsUploading(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">Change Photo</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <Card className="border-2 border-dashed border-default-300">
            <CardBody className="p-6 flex flex-col items-center gap-4">
              <div>
                {preview ? (
                  <div className="text-center mb-4">
                    <img
                      alt="Preview"
                      className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-primary/30"
                      src={preview}
                    />
                  </div>
                ) : null}
              </div>
              <input
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                id="adminUserPhotoFile"
                name="photo"
                type="file"
                onChange={handleFileChange}
              />
              <Button
                as="label"
                color="primary"
                htmlFor="adminUserPhotoFile"
                isDisabled={isUploading}
                startContent={<Upload className="w-4 h-4" />}
                variant="flat"
              >
                Select Photo
              </Button>
              <div className="text-center space-y-1">
                <p className="text-xs text-default-500">
                  Format: JPG, PNG. Max 1MB
                </p>
                {errorMessage && (
                  <p className="text-xs text-danger-500 font-medium bg-danger-50 px-2 py-1 rounded">
                    ⚠️ {errorMessage}
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          isDisabled={isUploading}
          variant="light"
          onPress={handleClose}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          isDisabled={!selectedFile || isUploading}
          startContent={
            isUploading ? <Spinner size="sm" /> : <Image className="w-4 h-4" />
          }
          onPress={handleUpload}
        >
          {isUploading ? "Processing..." : "Save"}
        </Button>
      </ModalFooter>
    </>
  );
}
