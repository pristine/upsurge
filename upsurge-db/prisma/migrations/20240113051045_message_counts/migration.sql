/*
  Warnings:

  - You are about to drop the `Drops` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Drops" DROP CONSTRAINT "Drops_messageDropAutomationId_fkey";

-- DropForeignKey
ALTER TABLE "Drops" DROP CONSTRAINT "Drops_timedDropAutomationId_fkey";

-- DropTable
DROP TABLE "Drops";

-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "messageDropAutomationId" TEXT,
    "timedDropAutomationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageCount" (
    "id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "messageCountAutomationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userServiceId" TEXT NOT NULL,
    "userServiceType" "ServiceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Drop_id_key" ON "Drop"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MessageCount_id_key" ON "MessageCount"("id");

-- AddForeignKey
ALTER TABLE "Drop" ADD CONSTRAINT "Drop_messageDropAutomationId_fkey" FOREIGN KEY ("messageDropAutomationId") REFERENCES "MessageDropAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drop" ADD CONSTRAINT "Drop_timedDropAutomationId_fkey" FOREIGN KEY ("timedDropAutomationId") REFERENCES "TimedDropAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCount" ADD CONSTRAINT "MessageCount_messageCountAutomationId_fkey" FOREIGN KEY ("messageCountAutomationId") REFERENCES "MessageCountAutomation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageCount" ADD CONSTRAINT "MessageCount_userId_userServiceId_userServiceType_fkey" FOREIGN KEY ("userId", "userServiceId", "userServiceType") REFERENCES "User"("id", "serviceId", "serviceType") ON DELETE RESTRICT ON UPDATE CASCADE;
