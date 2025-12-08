import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  // Ambil satu unit dan user yang sudah ada
  const unit = await prisma.unit.findFirst();
  const user = await prisma.user.findFirst();

  if (!unit || !user) {
    throw new Error("Unit dan User harus sudah ada di database!");
  }

  // Seed 3 breakdown
  await prisma.breakdown.createMany({
    data: [
      {
        id: uuidv4(),
        description: "Engine overheating",
        breakdownTime: new Date(),
        workingHours: 2.5,
        status: "pending",
        unitId: unit.id,
        reportedById: user.id,
        priority: "High",
        shift: "DAY",
      },
      {
        id: uuidv4(),
        description: "Hydraulic leak",
        breakdownTime: new Date(),
        workingHours: 1.2,
        status: "in_progress",
        unitId: unit.id,
        reportedById: user.id,
        priority: "Medium",
        shift: "NIGHT",
      },
      {
        id: uuidv4(),
        description: "Electrical fault",
        breakdownTime: new Date(),
        workingHours: 3.0,
        status: "rfu",
        unitId: unit.id,
        reportedById: user.id,
        priority: "Low",
        shift: "DAY",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Breakdown seeder selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
