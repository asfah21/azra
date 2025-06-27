"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
} from "@heroui/react";
import { useState } from "react";

interface InProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (unitStatus: string, notes?: string) => void;
  breakdownNumber?: string;
  unitName?: string;
  unitAssetTag?: string;
}

export default function InProgressModal({
  isOpen,
  onClose,
  onConfirm,
  breakdownNumber,
  unitName,
  unitAssetTag,
}: InProgressModalProps) {
  const [unitStatus, setUnitStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!unitStatus) {
      alert("Please select unit status");

      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(unitStatus, notes);
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUnitStatus("");
    setNotes("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Mark as In Progress
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card>
              {/* <CardHeader>
                <span className="font-semibold text-default-700">Info Breakdown</span>
              </CardHeader> */}
              <CardBody>
                <p className="text-sm text-default-600">
                  <strong>No:</strong> {breakdownNumber}
                </p>
                <p className="text-sm text-default-600">
                  <strong>Unit:</strong> {unitName} ({unitAssetTag})
                </p>
              </CardBody>
            </Card>

            <div className="space-y-2">
              <Select
                isRequired
                classNames={{
                  label: "text-sm font-medium",
                  trigger: [
                    "bg-default-200/50",
                    "dark:bg-default/60",
                    "backdrop-blur-xl",
                    "backdrop-saturate-200",
                    "hover:bg-default-200/70",
                    "dark:hover:bg-default/70",
                    "group-data-[focused=true]:bg-default-200/50",
                    "dark:group-data-[focused=true]:bg-default/60",
                  ],
                  value: "text-black/90 dark:text-white/90",
                }}
                label="Unit Status"
                name="unitStatus"
                placeholder="Select unit status"
                selectedKeys={unitStatus ? [unitStatus] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const keyArray = Array.from(keys);

                  setUnitStatus(keyArray[0]?.toString() || "");
                }}
              >
                <SelectItem key="operational">Operational</SelectItem>
                <SelectItem key="maintenance">Maintenance</SelectItem>
                <SelectItem key="broken">Broken</SelectItem>
                {/* Tambahkan opsi lain sesuai kebutuhan */}
              </Select>
            </div>

            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={notes}
                onValueChange={setNotes}
                minRows={3}
              />
            </div> */}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!unitStatus}
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
