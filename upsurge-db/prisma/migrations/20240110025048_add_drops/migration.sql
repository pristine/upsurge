/*
  Warnings:

  - Added the required column `amount` to the `MessageDropAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `TimedDropAutomation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageDropAutomation" ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TimedDropAutomation" ADD COLUMN     "amount" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Drops" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "messageDropAutomationId" TEXT,
    "timedDropAutomationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drops_id_key" ON "Drops"("id");

-- AddForeignKey
ALTER TABLE "Drops" ADD CONSTRAINT "Drops_messageDropAutomationId_fkey" FOREIGN KEY ("messageDropAutomationId") REFERENCES "MessageDropAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drops" ADD CONSTRAINT "Drops_timedDropAutomationId_fkey" FOREIGN KEY ("timedDropAutomationId") REFERENCES "TimedDropAutomation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
