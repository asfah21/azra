-- AlterTable
ALTER TABLE "Breakdown" ADD COLUMN     "inProgressAt" TIMESTAMP(3),
ADD COLUMN     "inProgressById" TEXT;

-- AddForeignKey
ALTER TABLE "Breakdown" ADD CONSTRAINT "Breakdown_inProgressById_fkey" FOREIGN KEY ("inProgressById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
