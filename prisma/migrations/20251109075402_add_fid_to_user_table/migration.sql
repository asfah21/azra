/*
  Warnings:

  - A unique constraint covering the columns `[fid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fid" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_fid_key" ON "User"("fid");
