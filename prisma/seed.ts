// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { consolePino } from "@/lib/logger";

const prisma = new PrismaClient();

async function main() {
  // Seeding Kategori
  await prisma.category.createMany({
    data: [{ name: "Alat Berat" }, { name: "Elektronik" }],
    skipDuplicates: true,
  });

  // Seeding User
  const hashedPassword = await bcrypt.hash("user1234", 12);

  await prisma.user.upsert({
    where: { email: "user1234@gmail.com" },
    update: { password: hashedPassword },
    create: {
      name: "User",
      email: "user1234@gmail.com",
      password: hashedPassword,
      role: "super_admin",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?u=1",
      photo: "https://i.pravatar.cc/150?u=1",
      status: "online",
      lastActive: new Date(),
      tasksCompleted: 1,
      joinDate: new Date(),
    },
  });
}

main()
  .catch((e) => {
    consolePino.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
