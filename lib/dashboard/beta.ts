import { prisma } from "@/lib/prisma";

export async function getUserCount() {
  const counts = await prisma.user.count();

  return counts;
}

export async function getUserList() {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
}
