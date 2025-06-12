import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ["query"], // opsional, bantu debug di dev
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

// // lib/prisma.ts (Updated for Prisma 5.x with Client Extensions)
// import { PrismaClient } from "@prisma/client";

// const prismaClientSingleton = () => {
//   const baseClient = new PrismaClient({
//     datasources: {
//       db: {
//         url:
//           process.env.DATABASE_URL +
//           `?connection_limit=${process.env.NODE_ENV === "production" ? 10 : 5}` +
//           `&pool_timeout=${process.env.NODE_ENV === "production" ? 30 : 10}` +
//           `&statement_cache_size=0` + // Disable prepared statement cache
//           `&prepared_statements=false`, // Disable prepared statements
//       },
//     },
//     log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
//   });

//   // Use Client Extensions instead of deprecated middleware
//   return baseClient.$extends({
//     query: {
//       // Apply to all models and operations
//       $allModels: {
//         async $allOperations({ model, operation, args, query }) {
//           try {
//             return await query(args);
//           } catch (error: any) {
//             // Handle various connection and prepared statement errors
//             const shouldRetry =
//               error.code === "P2024" || // Connection pool timeout
//               error.code === "P1001" || // Connection refused
//               error.code === "26000" || // PostgreSQL prepared statement error
//               error.message?.includes("connection") ||
//               error.message?.includes("prepared statement") ||
//               error.message?.includes("does not exist");

//             if (shouldRetry) {
//               console.warn(
//                 `Retrying ${model}.${operation} after error:`,
//                 error.message,
//               );
//               await new Promise((resolve) => setTimeout(resolve, 200));

//               return query(args);
//             }
//             throw error;
//           }
//         },
//       },
//     },
//   });
// };

// type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientSingleton | undefined;
// };

// export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// export default prisma;
