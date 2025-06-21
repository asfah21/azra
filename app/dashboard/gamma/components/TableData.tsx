"use client";

import {
    Card,
    CardHeader,
    CardBody,
    Divider,
    Chip,
    Button,
    User,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    useDisclosure,
    Modal,
    ModalContent,
} from "@heroui/react";
import {
    Wrench,
    Clock,
    AlertTriangle,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    User as UserIcon,
    Zap,
    Settings,
    CheckSquare,
    PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AddWoForm } from "./AddForm";

interface BreakdownPayload {
    id: string;
    breakdownNumber: string | null;
    description: string;
    breakdownTime: Date;
    workingHours: number;
    status: "pending" | "in_progress" | "rfu" | "overdue";
    createdAt: Date;
    unitId: string;
    reportedById: string;
    unit: {
        id: string;
        assetTag: string;
        name: string;
        location: string;
        department: string | null; // Updated to allow null
        categoryId: number;
    };
    reportedBy: {
        id: string;
        name: string;
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
}

interface WoStatsCardsProps {
    dataTable: BreakdownPayload[];
}

export default function GammaTableData({ dataTable }: WoStatsCardsProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();

    const handleUserAdded = () => {
        // Refresh halaman untuk update data setelah user ditambah
        router.refresh();
        onOpenChange();
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "success";
            case "in-progress":
                return "primary";
            case "pending":
                return "warning";
            case "scheduled":
                return "secondary";
            case "on-hold":
                return "default";
            case "cancelled":
                return "danger";
            default:
                return "default";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "preventive":
                return "🔧";
            case "corrective":
                return "🚨";
            case "inspection":
                return "🔍";
            case "installation":
                return "⚙️";
            default:
                return "📋";
        }
    };

    return (
        <div>
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="p-2 bg-default-500 rounded-lg">
                        <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-lg sm:text-xl font-semibold text-default-800">
                            All Work Orders
                        </p>
                        <p className="text-xs sm:text-small text-default-600">
                            Complete work order management and tracking
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="hidden sm:flex"
                            color="default"
                            size="sm"
                            startContent={<Filter className="w-4 h-4" />}
                            variant="flat"
                        >
                            Filter
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none"
                            color="primary"
                            size="sm"
                            startContent={<PlusIcon className="w-4 h-4" />}
                            onPress={onOpen}
                        >
                            Add WO
                        </Button>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-0">
                    <div className="overflow-x-auto">
                        <Table aria-label="Work orders table">
                            <TableHeader>
                                <TableColumn>ORDER</TableColumn>
                                <TableColumn>ASSIGNEE</TableColumn>
                                <TableColumn>PRIORITY</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>LOCATION</TableColumn>
                                <TableColumn>DUE DATE</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {dataTable.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        {order.breakdownNumber ?? "Not Found!"}
                                                    </span>
                                                    <span className="text-xs">
                                                        {getTypeIcon(order.unit.assetTag)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-default-600 line-clamp-1">
                                                    {order.unit.name}
                                                </p>
                                                <p className="text-xs text-default-500">
                                                    Asset ID: {order.unit.assetTag}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <User
                                                avatarProps={{
                                                    radius: "lg",
                                                    // src: order.assigneeAvatar,
                                                    size: "sm",
                                                }}
                                                classNames={{
                                                    description: "text-default-500",
                                                }}
                                                description={order.unit.department}
                                                name={order.reportedBy.name}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                // color={getPriorityColor(order.priority) as any}
                                                color="primary"
                                                size="sm"
                                                // startContent={getPriorityIcon(order.priority)}
                                                variant="flat"
                                            >
                                                {/* {order.priority} */} <p>RFU</p>
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Chip
                                                    color={getStatusColor(order.status) as any}
                                                    size="sm"
                                                    variant="dot"
                                                >
                                                    {order.status}
                                                </Chip>
                                                {" "}
                                                <p>Est</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-small">
                                                {/* <p className="font-medium">{order.location}</p> */}
                                                <p>Location</p>
                                                <p className="text-default-500 text-xs">
                                                    {/* {order.equipment} */} Equipment
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-small">
                                                {/* <p className="font-medium">{order.dueDate}</p> */}
                                                <p>Order</p>
                                                <p className="text-default-500 text-xs">
                                                    {/* {order.estimatedHours}h est. */}est.
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-2">
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Button isIconOnly size="sm" variant="light">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu>
                                                        <DropdownItem
                                                            key="details"
                                                            startContent={<Eye className="w-4 h-4" />}
                                                        >
                                                            View Details
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="edit"
                                                            startContent={<Edit className="w-4 h-4" />}
                                                        >
                                                            Edit Order
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="completed"
                                                            startContent={<CheckSquare className="w-4 h-4" />}
                                                        >
                                                            Mark Complete
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="reassign"
                                                            startContent={<UserIcon className="w-4 h-4" />}
                                                        >
                                                            Reassign
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            key="cancel"
                                                            className="text-danger"
                                                            color="danger"
                                                            startContent={<Trash2 className="w-4 h-4" />}
                                                        >
                                                            Cancel Order
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
            {/* Modal */}
            <div className="mx-4">
                <Modal
                    isOpen={isOpen}
                    placement="top-center"
                    size="2xl"
                    onOpenChange={onOpenChange}
                >
                    <ModalContent>
                        {(onClose) => (
                            <AddWoForm onBreakdownAdded={handleUserAdded} onClose={onClose} />
                        )}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}