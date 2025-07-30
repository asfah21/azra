// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seeding Kategori
  await prisma.category.createMany({
    data: [{ name: "Alat Berat" }, { name: "Elektronik" }],
    skipDuplicates: true,
  });

  // Seeding User
  const hashedPassword = await bcrypt.hash("9510Asfah210@", 12);

  await prisma.user.upsert({
    where: { email: "asfah21@gmail.com" },
    update: { password: hashedPassword },
    create: {
      name: "Muh. Al-Asfahani",
      email: "asfah21@gmail.com",
      password: hashedPassword,
      role: "super_admin",
      department: "IT Operations",
      // avatar: "https://i.pravatar.cc/150?u=1",
      status: "online",
      lastActive: new Date(),
      tasksCompleted: 1,
      joinDate: new Date(),
    },
  });
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
