// app/ace/page.tsx
import UserTableWrapper from "./components/UserTableWrapper";
import prisma from "@/lib/prisma";
import { title } from "@/components/primitives";
import type { Prisma } from '@prisma/client';

// Gunakan Prisma generated type
type UserSelect = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    department: true;
    createdAt: true;
  };
}>;

export default async function UsersPage() {
  let users: UserSelect[] = [];
  
  try {
    await prisma.$disconnect();
    
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error('Database connection error during build:', error);
    users = [];
  } finally {
    await prisma.$disconnect();
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <h1 className={title()}>Ace</h1>
        <UserTableWrapper users={users} />
      </div>
    </section>
  );
}