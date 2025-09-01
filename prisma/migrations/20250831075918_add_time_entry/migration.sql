-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('DAY', 'NIGHT');

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "activity" TEXT NOT NULL,
    "activityDesc" TEXT NOT NULL,
    "location" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeEntry_userId_shiftDate_shiftType_idx" ON "TimeEntry"("userId", "shiftDate", "shiftType");

-- CreateIndex
CREATE INDEX "TimeEntry_shiftDate_shiftType_idx" ON "TimeEntry"("shiftDate", "shiftType");

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
