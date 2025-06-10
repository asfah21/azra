import { UserMgc } from "./components/UserManagement";

import prisma from "@/lib/prisma";
import { title } from "@/components/primitives";

export default async function UsersPage() {
  // Fetch data di server component
  const users = await prisma.user.findMany({
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

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <h1 className={title()}>Ace</h1>
        <UserMgc users={users} />
      </div>
    </section>
  );
}
