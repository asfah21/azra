// Ini contoh file Server Component
// Di Next.js, Client Components ("use client") TIDAK BOLEH async. Hanya Server Components yang boleh async. jadi UseTableClient dipisah.
import { User } from "@prisma/client";

import UserTableClient from "./components/UserTableClient";

import { prisma } from "@/lib/prisma";
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
        <UserTableClient users={users} />
      </div>
    </div>
  );
}
