// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

import { consolePino } from "./logger";

// Ensure a single PrismaClient instance across dev hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Handle connection issues
prisma.$connect().catch((error) => {
  consolePino.error("Failed to connect to database:", error);
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
