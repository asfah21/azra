"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Chip,
  User,
  Divider,
} from "@heroui/react";

// Tipe data breakdown, bisa diimpor dari file types jika ada
type Breakdown = {
  id: string;
  breakdownNumber: string | null;
  description: string;
  breakdownTime: Date;
  workingHours: number;
  status: string;
  unit: {
    name: string;
    assetTag: string;
    location: string;
  };
  reportedBy: {
    name: string | null;
    email: string;
  };
  inProgressBy?: {
    name: string | null;
    email: string;
  } | null;
  inProgressAt?: Date | null;
  components: {
    id: string;
    component: string;
    subcomponent: string;
  }[];
  rfuReport?: {
    id: string;
    solution: string;
    resolvedAt: Date;
    resolvedById: string;
    resolvedBy: {
      id: string;
      name: string;
      email: string;
    };
    actions?: {
      id: string;
      action: string;
      description: string | null;
      actionTime: Date;
    }[];
  } | null;
};

interface BreakdownDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: Breakdown | null;
}

export default function BreakdownDetailModal({
  isOpen,
  onClose,
  breakdown,
}: BreakdownDetailModalProps) {
  if (!breakdown) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "rfu":
        return "success";
      case "in_progress":
        return "primary";
      case "pending":
        return "warning";
      case "overdue":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="top-center"
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onClose}
    >
      <ModalContent>
        {(_onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  NO #{breakdown.breakdownNumber}
                </h1>
                <p className="text-sm text-default-500">
                  Detail laporan kerusakan unit.
                </p>
              </div>
              <Chip
                className="text-base font-semibold px-4 py-1 mr-4"
                color={getStatusColor(breakdown.status) as any}
                variant="solid"
              >
                {breakdown.status.replace("_", " ").toUpperCase()}
              </Chip>
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-6">
                {/* Informasi Ringkas */}
                <Card>
                  <CardBody>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-default-500 w-32">
                          Status
                        </span>
                        <Chip
                          className="font-medium"
                          color={getStatusColor(breakdown.status) as any}
                          variant="flat"
                        >
                          {breakdown.status.replace("_", " ")}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-default-500 w-32">
                          Dilaporkan
                        </span>
                        <span className="text-default-900">
                          {new Date(breakdown.breakdownTime).toLocaleString(
                            "id-ID",
                            {
                              dateStyle: "full",
                              timeStyle: "short",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-default-500 w-32">
                          Working Hours
                        </span>
                        <span className="text-default-900">
                          {breakdown.workingHours} jam
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-default-500 w-32">
                          Reported By
                        </span>
                        <User
                          classNames={{
                            name: "text-default-900",
                            description: "text-default-600",
                          }}
                          description={breakdown.reportedBy.email}
                          name={breakdown.reportedBy.name}
                        />
                      </div>
                      {breakdown.inProgressBy && breakdown.inProgressAt && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-500 w-32">
                              In Progress By
                            </span>
                            <User
                              classNames={{
                                name: "text-default-900",
                                description: "text-default-600",
                              }}
                              description={breakdown.inProgressBy.email}
                              name={breakdown.inProgressBy.name}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-500 w-32">
                              Started At
                            </span>
                            <span className="text-default-900">
                              {new Date(breakdown.inProgressAt).toLocaleString(
                                "id-ID",
                                {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                },
                              )}
                            </span>
                          </div>
                        </>
                      )}
                      {breakdown.rfuReport && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-500 w-32">
                              RFU by
                            </span>
                            <User
                              classNames={{
                                name: "text-default-900",
                                description: "text-default-600",
                              }}
                              description={
                                breakdown.rfuReport.resolvedBy?.email || "-"
                              }
                              name={breakdown.rfuReport.resolvedBy?.name || "-"}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-500 w-32">
                              RFU Date
                            </span>
                            <span className="text-default-900">
                              {new Date(
                                breakdown.rfuReport.resolvedAt,
                              ).toLocaleString("id-ID", {
                                dateStyle: "full",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Informasi Unit */}
                <Card>
                  <CardBody>
                    <h2 className="text-lg font-semibold mb-3">
                      Unit Information
                    </h2>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-default-500">Unit Name</p>
                        <p className="text-default-900">
                          {breakdown.unit.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Asset Tag</p>
                        <p className="text-default-900">
                          {breakdown.unit.assetTag}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Location</p>
                        <p className="text-default-900">
                          {breakdown.unit.location}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <Divider />
                {/* Section Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deskripsi & Komponen */}
                  <div className="space-y-4">
                    <Card>
                      <CardBody>
                        <h2 className="text-lg font-semibold mb-3">
                          Deskripsi Kerusakan
                        </h2>
                        <p className="text-default-600">
                          {breakdown.description}
                        </p>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardBody>
                        <h2 className="text-lg font-semibold mb-3">
                          Komponen Terkait
                        </h2>
                        <ul className="space-y-2">
                          {breakdown.components.map((comp) => (
                            <li
                              key={comp.id}
                              className="flex items-center gap-2"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span className="text-default-600">
                                {comp.subcomponent}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
                  </div>

                  {/* RFU Report */}
                  {breakdown.rfuReport && (
                    <Card>
                      <CardBody>
                        <h2 className="text-lg font-semibold mb-3">
                          RFU Report
                        </h2>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-default-500">
                              Solusi
                            </p>
                            <p className="text-default-900">
                              {breakdown.rfuReport.solution}
                            </p>
                          </div>
                          {breakdown.rfuReport.actions &&
                            breakdown.rfuReport.actions.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-default-500 mb-2">
                                  Tindakan
                                </p>
                                <div className="space-y-2">
                                  {breakdown.rfuReport.actions.map(
                                    (action, index) => (
                                      <div
                                        key={action.id}
                                        className="border rounded-lg p-3 bg-default-50"
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <Chip
                                            color="primary"
                                            size="sm"
                                            variant="flat"
                                          >
                                            Action #{index + 1}
                                          </Chip>
                                          <span className="text-xs text-default-500">
                                            {new Date(
                                              action.actionTime,
                                            ).toLocaleString("id-ID", {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            })}
                                          </span>
                                        </div>
                                        <p className="font-medium text-default-900 mb-1">
                                          {action.action}
                                        </p>
                                        {action.description && (
                                          <p className="text-sm text-default-600">
                                            {action.description}
                                          </p>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
