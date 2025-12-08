import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function getUsers() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        lastActive: true,
        photo: true,
        fid: true,
        nik: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}