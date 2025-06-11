"use client";

import { Modal, ModalContent, Button, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";

import { AddUserForm } from "./AddUserForm";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  createdAt: Date;
}

interface UserManagementClientProps {
  users: User[];
}

export function UserTables({ users }: UserManagementClientProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const handleUserAdded = () => {
    // Refresh halaman untuk update data setelah user ditambah
    router.refresh();
    onOpenChange();
  };

  return (
    <div className="container mx-auto px-4 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button color="primary" onPress={onOpen}>
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <Table fullWidth aria-label="Users table" className="w-full">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>DEPARTMENT</TableColumn>
            <TableColumn>JOINED</TableColumn>
            <TableColumn>TASKS</TableColumn>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-semibold">{user.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-600">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Chip color="primary" size="sm" variant="flat">
                    {user.role}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.department ?? "N/A"}</div>
                </TableCell>
                <TableCell>
                  <Chip color="default" size="sm" variant="flat">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    {/* {user.status ?? "Unknown"} */}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip color="secondary" variant="flat">
                    <div className="">0</div>
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No users found.</p>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        placement="top-center"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <AddUserForm onClose={onClose} onUserAdded={handleUserAdded} />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}