/*
  Warnings:

  - Added the required column `lowerBounds` to the `MessageCountAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upperBounds` to the `MessageCountAutomation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageCountAutomation" ADD COLUMN     "lowerBounds" INTEGER NOT NULL,
ADD COLUMN     "upperBounds" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "messageCountGoal" INTEGER NOT NULL DEFAULT 100;

-- CreateTable
CREATE TABLE "MessageDropAutomation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "lowerBounds" INTEGER NOT NULL,
    "upperBounds" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL,
    "goal" INTEGER NOT NULL,

    CONSTRAINT "MessageDropAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimedDropAutomation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "lowerBounds" INTEGER NOT NULL,
    "upperBounds" INTEGER NOT NULL,
    "nextDropTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimedDropAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userServiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageDropAutomation_serviceId_serviceType_key" ON "MessageDropAutomation"("serviceId", "serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "TimedDropAutomation_serviceId_serviceType_key" ON "TimedDropAutomation"("serviceId", "serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "UserMessage_id_key" ON "UserMessage"("id");

-- AddForeignKey
ALTER TABLE "MessageDropAutomation" ADD CONSTRAINT "MessageDropAutomation_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimedDropAutomation" ADD CONSTRAINT "TimedDropAutomation_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_userId_userServiceId_fkey" FOREIGN KEY ("userId", "userServiceId") REFERENCES "User"("id", "serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
