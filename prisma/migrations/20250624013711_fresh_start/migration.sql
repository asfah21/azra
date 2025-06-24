-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'admin_heavy', 'admin_elec', 'pengawas', 'mekanik');

-- CreateEnum
CREATE TYPE "BreakdownStatus" AS ENUM ('pending', 'in_progress', 'rfu', 'overdue');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "avatar" TEXT,
    "status" TEXT,
    "lastActive" TIMESTAMP(3),
    "tasksCompleted" INTEGER,
    "joinDate" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'operational',
    "condition" TEXT,
    "serialNumber" TEXT,
    "location" TEXT NOT NULL,
    "department" TEXT,
    "manufacturer" TEXT,
    "installDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "assetValue" DOUBLE PRECISION,
    "utilizationRate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Breakdown" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "breakdownTime" TIMESTAMP(3) NOT NULL,
    "workingHours" DOUBLE PRECISION NOT NULL,
    "status" "BreakdownStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "breakdownNumber" TEXT,
    "priority" TEXT,
    "shift" TEXT,

    CONSTRAINT "Breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreakdownComponent" (
    "id" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "subcomponent" TEXT NOT NULL,
    "breakdownId" TEXT NOT NULL,

    CONSTRAINT "BreakdownComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFUReport" (
    "id" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakdownId" TEXT NOT NULL,
    "resolvedById" TEXT NOT NULL,
    "workDetails" TEXT,

    CONSTRAINT "RFUReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFUReportAction" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "actionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rfuReportId" TEXT NOT NULL,

    CONSTRAINT "RFUReportAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitHistory" (
    "id" TEXT NOT NULL,
    "logType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "UnitHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_assetTag_key" ON "Unit"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "RFUReport_breakdownId_key" ON "RFUReport"("breakdownId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breakdown" ADD CONSTRAINT "Breakdown_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Breakdown" ADD CONSTRAINT "Breakdown_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakdownComponent" ADD CONSTRAINT "BreakdownComponent_breakdownId_fkey" FOREIGN KEY ("breakdownId") REFERENCES "Breakdown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFUReport" ADD CONSTRAINT "RFUReport_breakdownId_fkey" FOREIGN KEY ("breakdownId") REFERENCES "Breakdown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFUReport" ADD CONSTRAINT "RFUReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RFUReportAction" ADD CONSTRAINT "RFUReportAction_rfuReportId_fkey" FOREIGN KEY ("rfuReportId") REFERENCES "RFUReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitHistory" ADD CONSTRAINT "UnitHistory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
