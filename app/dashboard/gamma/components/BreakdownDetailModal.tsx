"use client";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
    Divider,
    Chip,
    User,
    Button,
} from "@heroui/react";
import { X } from "lucide-react";

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
        };
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
            onOpenChange={onClose}
            size="3xl"
            placement="top-center"
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-xl font-bold">
                                        Breakdown #{breakdown.breakdownNumber}
                                    </h1>
                                    <p className="text-sm text-default-500">
                                        Details of the reported breakdown.
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <Chip color={getStatusColor(breakdown.status) as any} variant="flat">                                        
                                        <p className="text-default-600">{breakdown.status}</p>
                                    </Chip>
                                    <Card>
                                        <CardBody>
                                            <h2 className="text-lg font-semibold mb-3">Description</h2>
                                            <p className="text-default-600">{breakdown.description}</p>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody>
                                            <h2 className="text-lg font-semibold mb-3">Components</h2>
                                            <ul className="space-y-2">
                                                {breakdown.components.map((comp) => (
                                                    <li key={comp.id} className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                        <span className="font-medium">{comp.component}:</span>
                                                        <span className="text-default-600">{comp.subcomponent}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardBody>
                                    </Card>

                                    {breakdown.rfuReport && (
                                        <Card>
                                            <CardBody>
                                                <h2 className="text-lg font-semibold mb-3">RFU Report</h2>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-default-500">Solution</p>
                                                        <p className="text-default-900">{breakdown.rfuReport.solution}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-default-500">Resolved At</p>
                                                        <p className="text-default-900">
                                                            {new Date(breakdown.rfuReport.resolvedAt).toLocaleString("id-ID", {
                                                                dateStyle: "full",
                                                                timeStyle: "short",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-default-500">Marked as RFU by</p>
                                                        <User
                                                            name={breakdown.rfuReport.resolvedBy.name}
                                                            description={`ID: ${breakdown.rfuReport.resolvedBy.id}`}
                                                            classNames={{
                                                                name: "text-default-900",
                                                                description: "text-default-600",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <Card>
                                        <CardBody>
                                            <h2 className="text-lg font-semibold mb-3">Information</h2>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Unit Name</p>
                                                    <p className="text-default-900">{breakdown.unit.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Asset Tag</p>
                                                    <p className="text-default-900">{breakdown.unit.assetTag}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Location</p>
                                                    <p className="text-default-900">{breakdown.unit.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Reported At</p>
                                                    <p className="text-default-900">
                                                        {new Date(breakdown.breakdownTime).toLocaleString("id-ID", {
                                                            dateStyle: "full",
                                                            timeStyle: "short",
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Working Hours</p>
                                                    <p className="text-default-900">
                                                        {breakdown.workingHours} hours
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-default-500">Reported By</p>
                                                    <User
                                                        name={breakdown.reportedBy.name}
                                                        description={breakdown.reportedBy.email}
                                                        classNames={{
                                                            name: "text-default-900",
                                                            description: "text-default-600",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
} 