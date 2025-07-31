"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import { Plus, Trash2, Clock } from "lucide-react";

interface RFUAction {
  id: string;
  action: string;
  description: string;
  actionTime: Date;
}

interface RFUReportActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdownId: string;
  breakdownNumber: string | null;
  onRFUComplete: (
    solution: string,
    actions: Omit<RFUAction, "id" | "actionTime">[],
  ) => Promise<void>;
}

export default function RFUReportActionModal({
  isOpen,
  onClose,
  breakdownId,
  breakdownNumber,
  onRFUComplete,
}: RFUReportActionModalProps) {
  const [solution, setSolution] = useState("");
  const [actions, setActions] = useState<
    Omit<RFUAction, "id" | "actionTime">[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAction = () => {
    setActions([
      ...actions,
      {
        action: "",
        description: "",
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (
    index: number,
    field: "action" | "description",
    value: string,
  ) => {
    const newActions = [...actions];

    newActions[index] = {
      ...newActions[index],
      [field]: value,
    };
    setActions(newActions);
  };

  const handleSubmit = async () => {
    if (!solution.trim()) {
      alert("Solusi harus diisi!");

      return;
    }

    if (actions.length === 0) {
      alert("Minimal satu action harus ditambahkan!");

      return;
    }

    // Validasi semua action memiliki action name
    const hasEmptyActions = actions.some((action) => !action.action.trim());

    if (hasEmptyActions) {
      alert("Semua action harus memiliki nama action!");

      return;
    }

    setIsSubmitting(true);
    try {
      await onRFUComplete(solution, actions);
      // Reset form
      setSolution("");
      setActions([]);
      onClose();
    } catch (error) {
      console.error("Error completing RFU:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSolution("");
      setActions([]);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="top-center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={handleClose}
    >
      <ModalContent>
        {(_onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold">
                    Mark as RFU - #{breakdownNumber}
                  </h1>
                  <p className="text-sm text-default-500">
                    Isi detail solusi dan action yang telah dikerjakan
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-6">
                {/* Solution */}
                <Card>
                  <CardBody>
                    <h2 className="text-lg font-semibold mb-3">
                      Solusi / Kesimpulan
                    </h2>
                    <Textarea
                      isRequired
                      label="Jelaskan solusi atau kesimpulan dari perbaikan"
                      maxRows={5}
                      minRows={3}
                      placeholder="Contoh: Mesin sudah berfungsi normal setelah penggantian bearing..."
                      value={solution}
                      onValueChange={setSolution}
                    />
                  </CardBody>
                </Card>

                {/* Actions */}
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">
                        Action yang Dikerjakan
                      </h2>
                      <Button
                        color="primary"
                        size="sm"
                        startContent={<Plus className="w-4 h-4" />}
                        onPress={addAction}
                      >
                        Tambah Action
                      </Button>
                    </div>

                    {actions.length === 0 ? (
                      <div className="text-center py-8 text-default-500">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada action yang ditambahkan</p>
                        <p className="text-sm">
                          Klik &quot;Tambah Action&quot; untuk menambahkan
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {actions.map((action, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-default-50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Chip color="primary" size="sm" variant="flat">
                                Action #{index + 1}
                              </Chip>
                              <Button
                                isIconOnly
                                color="danger"
                                size="sm"
                                variant="light"
                                onPress={() => removeAction(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-3">
                              <Input
                                isRequired
                                label="Nama Action"
                                placeholder="Contoh: Penggantian bearing, Pembersihan filter..."
                                value={action.action}
                                onValueChange={(value: string) =>
                                  updateAction(index, "action", value)
                                }
                              />
                              <Textarea
                                className="hidden"
                                label="Deskripsi (Opsional)"
                                maxRows={3}
                                minRows={2}
                                placeholder="Jelaskan detail action yang dilakukan..."
                                // value={action.description}
                                value="Optional"
                                onValueChange={(value: string) =>
                                  updateAction(index, "description", value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                isDisabled={isSubmitting}
                variant="light"
                onPress={handleClose}
              >
                Batal
              </Button>
              <Button
                color="primary"
                isDisabled={!solution.trim() || actions.length === 0}
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? "Menyimpan..." : "Mark as RFU"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
