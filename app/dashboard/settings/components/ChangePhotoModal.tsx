"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Card,
  CardBody,
} from "@heroui/react";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { updatePhoto } from "../action";

export default function ChangePhotoModal({
  isOpen,
  onClose,
  onPhotoUploaded,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded?: (url: string) => void;
  userId: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();

    formData.append("photo", selectedFile);
    // @ts-ignore
    const url = await updatePhoto(userId, formData);

    setLoading(false);
    if (onPhotoUploaded) onPhotoUploaded(url);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onClose}>
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Ganti Foto Profil</h2>
              <p className="text-sm text-default-600">
                Upload foto profil baru untuk akun Anda
              </p>
            </ModalHeader>
            <ModalBody>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Card className="border-2 border-dashed border-default-300">
                  <CardBody className="p-6 flex flex-col items-center gap-4">
                    <div className="p-3 bg-primary-50 rounded-full">
                      <ImageIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium">Upload Foto</h3>
                      <p className="text-sm text-default-600">
                        Pilih file gambar untuk dijadikan foto profil
                      </p>
                    </div>
                    <input
                      accept="image/*"
                      className="hidden"
                      id="photoFile"
                      name="photo"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;

                        if (file && file.size > 1024 * 1024) {
                          setError("Ukuran gambar maksimal 1MB.");
                          e.target.value = "";
                          setSelectedFile(null);

                          return;
                        }
                        setError(null);
                        setSelectedFile(file);
                      }}
                    />
                    <Button
                      as="label"
                      color="primary"
                      htmlFor="photoFile"
                      startContent={<ImageIcon className="w-4 h-4" />}
                      variant="flat"
                    >
                      Pilih Foto
                    </Button>
                    {selectedFile && (
                      <p className="text-sm text-success-600">
                        File terpilih: {selectedFile.name}
                      </p>
                    )}
                    {error && (
                      <div className="text-sm text-danger-600 text-center mt-2">
                        {error}
                      </div>
                    )}
                  </CardBody>
                </Card>
                <div className="flex justify-end mt-4">
                  {/* <Button className="mr-2" type="button" variant="flat" onClick={close}>
                    Batal
                  </Button> */}
                  <Button color="success" isLoading={loading} type="submit">
                    Simpan Foto
                  </Button>
                </div>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
