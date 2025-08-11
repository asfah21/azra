-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'guest';

-- AlterTable
ALTER TABLE "Breakdown" ADD COLUMN     "photo" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photo" TEXT;
