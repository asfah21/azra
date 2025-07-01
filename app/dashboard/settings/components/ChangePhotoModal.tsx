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

export default function ChangePhotoModal({
  isOpen,
  onClose,
  onSubmit,
  userId,
  updatePhoto,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  userId: string;
  updatePhoto: (userId: string, formData: FormData) => Promise<void>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
              <form
                action={async (formData) => {
                  await updatePhoto(userId, formData);
                  close();
                  onSubmit && onSubmit();
                }}
                className="space-y-6"
              >
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
                      type="file"
                      name="photo"
                      accept="image/*"
                      className="hidden"
                      id="photoFile"
                      onChange={(e) => {
                        setSelectedFile(e.target.files?.[0] || null);
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
                  </CardBody>
                </Card>
                <div className="flex justify-end mt-4">
                  <Button type="button" onClick={close} className="mr-2" variant="flat">
                    Batal
                  </Button>
                  <Button type="submit" color="primary">
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
