-- AlterEnum
ALTER TYPE "BreakdownStatus" ADD VALUE 'overdue';

-- AlterTable
ALTER TABLE "Breakdown" ADD COLUMN     "breakdownNumber" TEXT;
