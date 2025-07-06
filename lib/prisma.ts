import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fungsi untuk test koneksi database
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown database error" 
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default prisma;
