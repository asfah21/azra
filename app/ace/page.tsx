// Ini contoh file Server Component
// Di Next.js, Client Components ("use client") TIDAK BOLEH async. Hanya Server Components yang boleh async. jadi UseTableClient dipisah.

import { UserTables } from "./components/UserTable";
import AceCards from "./components/AceCard";

import prisma from "@/lib/prisma";
import { title } from "@/components/primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AcePages() {
  // Fetch all users
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

  // Get total user count
  const totalCount = await prisma.user.count();

  // Get new users count (this month)
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const newUsersCount = await prisma.user.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  // Prepare stats object
  const userStats = {
    total: totalCount,
    new: newUsersCount,
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <h1 className={title()}>Ace</h1>
        <AceCards totalCount={userStats} />
        <UserTables users={users} />
      </div>
    </section>
  );
}
