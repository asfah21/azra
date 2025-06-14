"use client";

import { Modal, ModalContent, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
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
} from "@heroui/react";
import {
  Users,
  UserPlus,
  Filter,
  MoreVertical,
  Mail,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import { AddUserForms } from "./AddUserForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
}

interface UserManagementClientProps {
  usersTable: User[];
}

export default function UserTables({ usersTable }: UserManagementClientProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin_elec":
        return "danger";
      case "admin_heavy":
        return "warning";
      case "pengawas":
        return "secondary";
      case "mekanik":
        return "primary";
      case "super_admin":
        return "success";
      default:
        return "default";
    }
  };

  // Label yang akan ditampilkan
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "pengawas":
        return "Foreman";
      case "mekanik":
        return "Mekanik";
      case "admin_heavy":
        return "Admin PAM";
      case "admin_elec":
        return "Admin";
      default:
        return role;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-3 flex-1 justify-start self-start">
            <div className="p-2 bg-default-500 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1 text-left">
              <p className="text-xl font-semibold text-default-800 text-left">
                All Users
              </p>
              <p className="text-small text-default-600 text-left">
                Complete user management
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none"
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
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={onOpen}
            >
              Add User
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-0">
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>DEPARTMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>TASKS</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {usersTable.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <User
                      avatarProps={{
                        radius: "lg",
                        // src: user.avatar,
                        size: "sm",
                      }}
                      classNames={{
                        description: "text-default-500",
                      }}
                      description={user.email}
                      name={user.name}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getRoleColor(user.role) as any}
                      size="sm"
                      variant="flat"
                    >
                      {getRoleLabel(user.role)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      <p className="font-medium">{user.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      // color={getStatusColor(user.status) as any}
                      size="sm"
                      variant="dot"
                    >
                      {/* {user.status} */}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      {/* <p className="font-medium">{user.tasksCompleted}</p> */}
                      <p className="text-default-500">completed</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-small">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
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
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                          >
                            View
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="contact"
                            startContent={<Mail className="w-4 h-4" />}
                          >
                            Contact
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      {/* Modal */}
      <Modal
        isOpen={isOpen}
        placement="top-center"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <AddUserForms onClose={onClose} onUserAdded={handleUserAdded} />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
