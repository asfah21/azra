"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
  Spinner,
  Card,
  CardBody,
} from "@heroui/react";
import { Image, Upload } from "lucide-react";
import { useState } from "react";

import { useProfile } from "@/app/context/ProfileContext"; // refresh setelah upload

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (file: File) => void;
}

export default function ChangePhotoModal({
  isOpen,
  onClose,
  onPhotoUploaded,
}: ChangePhotoModalProps) {
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

      // Create preview
      const reader = new FileReader();

      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { refreshProfile } = useProfile(); // refresh setelah upload

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      try {
        await onPhotoUploaded(selectedFile);
        await refreshProfile(); // refresh setelah upload
        handleClose();
      } catch (error) {
        addToast({
          title: "Gagal mengupload foto",
          description: "Terjadi kesalahan saat mengupload foto.",
          color: "danger",
        });
      } finally {
        setIsUploading(false);
      }
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
    <Modal
      classNames={{
        base: "mx-4",
        wrapper: "items-center justify-center",
        backdrop: "bg-black/50",
      }}
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent className="max-w-md mx-auto">
        <ModalHeader className="flex flex-col gap-1">
          Ganti Foto Profil
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="border-2 border-dashed border-default-300">
              <CardBody className="p-6 flex flex-col items-center gap-4">
                <div>
                  {preview && (
                    <div className="text-center mb-4">
                      <img
                        alt="Preview"
                        className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-primary/30"
                        src={preview}
                      />
                    </div>
                  )}
                  {/* <Image className="w-8 h-8 text-primary-600" /> */}
                </div>
                {/* <div className="text-center">
                  <h3 className="text-lg font-medium">Upload Foto</h3>
                  <p className="text-sm text-default-600">
                    Pilih file gambar untuk dijadikan foto profil
                  </p>
                </div> */}
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  id="photoFile"
                  name="photo"
                  type="file"
                  onChange={handleFileChange}
                />
                <Button
                  as="label"
                  color="primary"
                  htmlFor="photoFile"
                  isDisabled={isUploading}
                  startContent={<Upload className="w-4 h-4" />}
                  variant="flat"
                >
                  Pilih Foto
                </Button>
                <div className="text-center space-y-1">
                  <p className="text-xs text-default-500">
                    Format: JPG, PNG. Maksimal 1MB
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
            Batal
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedFile || isUploading}
            startContent={
              isUploading ? (
                <Spinner size="sm" />
              ) : (
                <Image className="w-4 h-4" />
              )
            }
            onPress={handleUpload}
          >
            {isUploading ? "Mengupload..." : "Upload Foto"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
