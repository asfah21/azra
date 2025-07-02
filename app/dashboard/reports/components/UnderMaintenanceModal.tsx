"use client";
import { VersiApp, VersionApp } from "@/components/ui/ChipVersion";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";

interface UnderMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UnderMaintenanceModal({ open, onClose }: UnderMaintenanceModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose} hideCloseButton placement="top-center" size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-2 bg-amber-50 dark:bg-amber-900/40 rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-full">
              <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-bold text-lg">In Development</span>
          </div>
        </ModalHeader>
        <ModalBody className="bg-white dark:bg-neutral-900">
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-gray-700 dark:text-gray-300 text-center text-base">
              Halaman ini masih dalam tahap <span className="font-semibold text-amber-600 dark:text-amber-300">Pengembangan</span>.<br />
              Beberapa fungsi belum tersedia untuk versi <VersiApp /> saat ini.
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="px-28">
          <Button color="danger" className="w-full" onPress={onClose}>
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
