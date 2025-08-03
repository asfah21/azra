"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Autocomplete,
  AutocompleteItem,
  Textarea,
} from "@heroui/react";
import { useState } from "react";

interface InProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (unitStatus: string, priority: string, notes?: string) => void;
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
  const [unitStatus, setUnitStatus] = useState<string>("operational");
  const [priority, setPriority] = useState<string>("low");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!unitStatus || !priority) {
      alert("Please complete all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(unitStatus, priority, notes);
      handleClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUnitStatus("operational");
    setPriority("low");
    setNotes("");
    setIsLoading(false);
    onClose();
  };

  const priorityList = [
    { label: "Low", key: "low" },
    { label: "Medium", key: "medium" },
    { label: "High", key: "high" },
  ];

  const unitStatusList = [
    { label: "Operational", key: "operational" },
    { label: "Maintenance", key: "maintenance" },
    { label: "Broken", key: "broken" },
  ];

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Mark as In Progress
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-2">
                <p className="text-sm text-default-600">
                  <strong>No:</strong> {breakdownNumber}
                </p>
                <p className="text-sm text-default-600">
                  <strong>Unit:</strong> {unitName} ({unitAssetTag})
                </p>
              </CardBody>
            </Card>

            <div className="space-y-4">
              <Autocomplete
                isRequired
                label="Priority"
                name="priority"
                labelPlacement="outside-top"
                placeholder="Select priority"
                variant="bordered"
                selectedKey={priority}
                onSelectionChange={(key) => setPriority(key as string)}
                defaultItems={priorityList}
                style={{ outline: "none" }}
                onFocus={(e) => (e.target.style.outline = "none")}
              >
                {(item) => (
                  <AutocompleteItem key={item.key}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>

              <Autocomplete
                isRequired
                label="Unit Status"
                name="unitStatus"
                labelPlacement="outside-top"
                placeholder="Select unit status"
                variant="bordered"
                selectedKey={unitStatus}
                onSelectionChange={(key) => setUnitStatus(key as string)}
                defaultItems={unitStatusList}
                style={{ outline: "none" }}
                onFocus={(e) => (e.target.style.outline = "none")}
              >
                {(item) => (
                  <AutocompleteItem key={item.key}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>

            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="warning"
            isDisabled={!unitStatus || !priority}
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
