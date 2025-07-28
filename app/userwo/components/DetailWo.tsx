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
  Button,
  CardHeader,
  ModalFooter,
} from "@heroui/react";
import { CalendarIcon, CheckCircleIcon, CircleCheckBig, ClockIcon, FileTextIcon, HardDriveIcon, LayersIcon, UserIcon, WrenchIcon } from "lucide-react";

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
    photo?: string | null;
  };
  inProgressBy?: {
    name: string | null;
    email: string;
    photo?: string | null;
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
    resolvedBy: {
      id: string;
      name: string;
      email: string;
      photo?: string;
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

export default function DetailWo({
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
      backdrop="blur"
      classNames={{
        base: "dark:bg-[#121214] bg-white border dark:border-[#272727] border-gray-200",
        header: "border-b dark:border-[#272727] border-gray-200",
        footer: "border-t dark:border-[#272727] border-gray-200",
        closeButton: "hover:bg-black/5 dark:hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold dark:text-white text-gray-900">
                    #{breakdown.breakdownNumber}
                  </h1>
                  <p className="text-sm dark:text-default-400 text-gray-500">
                    Detail Work Order
                  </p>
                </div>
                <div className="flex items-center gap-2 pr-4">
                  <Chip
                    className="text-sm font-semibold p-1 uppercase tracking-wider"
                    color={getStatusColor(breakdown.status) as any}
                    variant="shadow"
                    radius="sm"
                  >
                    {breakdown.status.replace("_", " ")}
                  </Chip>
                  {/* <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    radius="full"
                    onPress={onClose}
                    className="dark:text-default-400 text-gray-500 hover:text-black dark:hover:text-white"
                  >
                    <XIcon size={18} />
                  </Button> */}
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="pb-6 px-0">
              <div className="space-y-6 px-6">
                {/* Summary Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="dark:bg-gradient-to-br dark:from-[#1b1a1c] dark:to-[#19172c] bg-white border dark:border-[#272727] border-gray-200">
                    <CardBody>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg dark:bg-[#2a2342] bg-gray-100">
                            <CalendarIcon size={20} className="dark:text-purple-400 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs dark:text-default-400 text-gray-500">Reported At</p>
                            <p className="text-sm font-medium dark:text-white text-gray-900">
                              {new Date(breakdown.breakdownTime).toLocaleString(
                                "id-ID",
                                {
                                  dateStyle: "full",
                                  timeStyle: "short",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg dark:bg-[#2a2342] bg-gray-100">
                            <ClockIcon size={20} className="dark:text-blue-400 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs dark:text-default-400 text-gray-500">Hours Meter (HM)</p>
                            <p className="text-sm font-medium dark:text-white text-gray-900">
                              {breakdown.workingHours} hours
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
  
                  <Card className="dark:bg-gradient-to-br dark:from-[#1b1a1c] dark:to-[#19172c] bg-white border dark:border-[#272727] border-gray-200">
                    <CardBody>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg dark:bg-[#2a2342] bg-gray-100">
                            <UserIcon size={20} className="dark:text-cyan-400 text-cyan-600" />
                          </div>
                          <div>
                            <p className="text-xs dark:text-default-400 text-gray-500">Reported By</p>
                            <User
                              avatarProps={{
                                radius: "lg",
                                src: breakdown.reportedBy?.photo || "",
                                size: "sm",
                                className:
                                  "w-8 h-8 rounded-full object-cover flex-shrink-0",
                              }}
                              classNames={{
                                name: "text-sm font-medium dark:text-white text-gray-900",
                                description: "text-xs dark:text-default-400 text-gray-500",
                              }}
                              description={breakdown.reportedBy.email}
                              name={breakdown.reportedBy.name}
                            />
                          </div>
                        </div>
                        {breakdown.inProgressBy && breakdown.inProgressAt && (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg dark:bg-[#2a2342] bg-gray-100">
                              <WrenchIcon size={20} className="dark:text-yellow-400 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-xs dark:text-default-400 text-gray-500">Technician</p>
                              <User
                                avatarProps={{
                                  radius: "lg",
                                  src: breakdown.inProgressBy?.photo || "",
                                  size: "sm",
                                  className:
                                    "w-8 h-8 rounded-full object-cover flex-shrink-0",
                                }}
                                classNames={{
                                  name: "text-sm font-medium dark:text-white text-gray-900",
                                  description: "text-xs dark:text-default-400 text-gray-500",
                                }}
                                description={breakdown.inProgressBy.email}
                                name={breakdown.inProgressBy.name}
                              />
                            </div>
                          </div>
                        )}

                        {breakdown.rfuReport && (                          
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg dark:bg-[#2a2342] bg-gray-100">
                                <CircleCheckBig size={20} className="dark:text-green-400 text-green-600" />
                              </div>
                              <div>
                              <p className="text-xs dark:text-default-400 text-gray-500">RFU by</p>
                                <User
                                  avatarProps={{
                                    radius: "lg",
                                    src: breakdown.rfuReport.resolvedBy?.photo || "",
                                    size: "sm",
                                    className:
                                      "w-8 h-8 rounded-full object-cover flex-shrink-0",
                                  }}
                                  classNames={{
                                    name: "text-sm font-medium dark:text-white text-gray-900",
                                    description: "text-xs dark:text-default-400 text-gray-500",
                                  }}
                                  description={
                                    breakdown.rfuReport.resolvedBy?.email || "-"
                                  }
                                  name={breakdown.rfuReport.resolvedBy?.name || "-"}
                                />  
                              </div>
                            </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </div>
  
                {/* Unit Information */}
                <Card className="dark:bg-[#1b1a1c] bg-white border dark:border-[#272727] border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <HardDriveIcon className="dark:text-purple-400 text-purple-600" size={20} />
                      <h2 className="text-lg font-semibold dark:text-white text-gray-900">Unit Information</h2>
                    </div>
                  </CardHeader>
                  <Divider className="dark:bg-[#272727] bg-gray-200" />
                  <CardBody>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs dark:text-default-400 text-gray-500">Unit Name</p>
                        <p className="text-sm font-medium dark:text-white text-gray-900">
                          {breakdown.unit.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs dark:text-default-400 text-gray-500">Asset Tag</p>
                        <p className="text-sm font-medium dark:text-white text-gray-900">
                          {breakdown.unit.assetTag}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs dark:text-default-400 text-gray-500">Location</p>
                        <p className="text-sm font-medium dark:text-white text-gray-900">
                          {breakdown.unit.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs dark:text-default-400 text-gray-500">Serial Number</p>
                        <p className="text-sm font-medium dark:text-white text-gray-900">
                          {/* {breakdown.unit.serialNumber || "N/A"} */}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
  
                {/* Breakdown Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description & Components */}
                  <div className="space-y-4">
                    <Card className="dark:bg-[#1b1a1c] bg-white border dark:border-[#272727] border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="dark:text-blue-400 text-blue-600" size={20} />
                          <h2 className="text-lg font-semibold dark:text-white text-gray-900">Failure Description</h2>
                        </div>
                      </CardHeader>
                      <Divider className="dark:bg-[#272727] bg-gray-200" />
                      <CardBody>
                        <p className="text-sm dark:text-default-800 text-gray-700">
                          {breakdown.description}
                        </p>
                      </CardBody>
                    </Card>
  
                    <Card className="dark:bg-[#1b1a1c] bg-white border dark:border-[#272727] border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <LayersIcon className="dark:text-green-400 text-green-600" size={20} />
                          <h2 className="text-lg font-semibold dark:text-white text-gray-900">Affected Components</h2>
                        </div>
                      </CardHeader>
                      <Divider className="dark:bg-[#272727] bg-gray-200" />
                      <CardBody>
                        <ul className="space-y-3">
                          {Array.isArray(breakdown.components) &&
                            breakdown.components.map((comp) => (
                              <li
                                key={comp.id}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-1 w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium dark:text-white text-gray-900">{comp.subcomponent}</p>
                                  {/* {comp.description && (
                                    <p className="text-xs dark:text-default-400 text-gray-500">{comp.description}</p>
                                  )} */}
                                </div>
                              </li>
                            ))}
                        </ul>
                      </CardBody>
                    </Card>
                  </div>
  
                  {/* RFU Report */}
                  {breakdown.rfuReport && (
                    <Card className="dark:bg-[#1b1a1c] bg-white border dark:border-[#272727] border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="dark:text-green-400 text-green-600" size={20} />
                          <h2 className="text-lg font-semibold dark:text-white text-gray-900">Resolution Report</h2>
                        </div>
                      </CardHeader>
                      <Divider className="dark:bg-[#272727] bg-gray-200" />
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs dark:text-default-400 text-gray-500 mb-1">Solution</p>
                            <p className="text-sm dark:text-default-800 text-gray-700">
                              {breakdown.rfuReport.solution}
                            </p>
                          </div>
                          {breakdown.rfuReport.actions &&
                            breakdown.rfuReport.actions.length > 0 && (
                              <div>
                                <p className="text-xs dark:text-default-400 text-gray-500 mb-2">Performed Actions</p>
                                <div className="space-y-3">
                                  {breakdown.rfuReport.actions.map(
                                    (action, index) => (
                                      <div
                                        key={action.id}
                                        className="border dark:border-[#272727] border-gray-200 rounded-lg p-3 dark:bg-[#252346] bg-gray-50"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                            <Chip
                                              color="primary"
                                              size="sm"
                                              variant="shadow"
                                              radius="sm"
                                            >
                                              Action {index + 1}
                                            </Chip>
                                          </div>
                                          <span className="text-xs dark:text-default-500 text-gray-500">
                                            {new Date(
                                              action.actionTime
                                            ).toLocaleString("id-ID", {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium dark:text-white text-gray-900 mb-1">
                                          {action.action}
                                        </p>
                                        {action.description && (
                                          <p className="text-xs dark:text-default-400 text-gray-500">
                                            {action.description}
                                          </p>
                                        )}
                                      </div>
                                    )
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
            <ModalFooter className="dark:bg-[#1b1a1c] bg-white border-t dark:border-[#272727] border-gray-200 rounded-b-xl">
              <div className="flex justify-between w-full">
                <div className="flex items-center gap-2">
                  <ClockIcon size={16} className="dark:text-default-400 text-gray-500" />
                  {breakdown.rfuReport && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs lg:text-sm text-default-500">
                          RFU : {new Date(
                            breakdown.rfuReport.resolvedAt,
                          ).toLocaleString("id-ID", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </span>
                    </div>                    
                  )}
                </div>
                <Button
                  color="danger"
                  variant="shadow"
                  onPress={onClose}
                  className="text-white"
                >
                  Close
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
