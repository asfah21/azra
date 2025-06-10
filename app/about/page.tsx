// Contoh Server Component | SSR dari DB --> tampilkan data atau table saat halaman dibuka
"use client"; //Pakai use client karena pakai component HeroUI

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

import { prisma } from "@/lib/prisma"; // Import from singleton
import { title } from "@/components/primitives";

async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch user");
  }
}

export default async function AboutPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className={title()}>About</h1>
      <div className="container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Users</h1>
        </div>
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
                  <div className="text-sm">
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString()
                      : "N/A"}
                  </div>
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
                    <div className="">{user.tasksCompleted ?? 0}</div>
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>

    // <div>
    //   <h1 className={title()}>About</h1>
    //   <div className="container mx-auto px-4 mt-10">
    //     <h1 className="text-3xl font-bold mb-6">All Users</h1>
    //     <div className="space-y-4">
    //       {users.map((user) => (
    //         <div key={user.id} className="border p-4 rounded-lg">
    //           <h2 className="text-xl font-semibold">{user.name}</h2>
    //           <p className="text-gray-600">{user.email}</p>
    //           <p className="text-sm text-gray-500 mt-2">
    //             Role: {user.role} • Joined:{" "}
    //             {user.joinDate
    //               ? new Date(user.joinDate).toLocaleDateString()
    //               : "N/A"}
    //           </p>
    //           <p className="text-sm text-gray-500">
    //             Status: {user.status ?? "Unknown"} • Tasks:{" "}
    //             {user.tasksCompleted ?? 0}
    //           </p>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
}
