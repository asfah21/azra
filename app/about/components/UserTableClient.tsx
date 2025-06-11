// app/about/components/UserTableClient.tsx - Client Component
"use client";

import { User } from "@prisma/client";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";
import { Chip } from "@heroui/chip";

import { formatDate } from "@/lib/dateUtils";

interface Props {
  users: User[];
}

export default function UserTableClient({ users }: Props) {
  return (
    <Table fullWidth aria-label="Users table" className="w-full">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>ROLE</TableColumn>
        <TableColumn>JOINED</TableColumn>
        <TableColumn>STATUS</TableColumn>
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
              <div className="text-sm">{formatDate(user.joinDate)}</div>
            </TableCell>
            <TableCell>
              <Chip
                color={user.status === "Active" ? "success" : "default"}
                size="sm"
                variant="flat"
              >
                {user.status ?? "Unknown"}
              </Chip>
            </TableCell>
            <TableCell>
              <Chip color="secondary" variant="flat">
                <div>{user.tasksCompleted ?? 0}</div>
              </Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
