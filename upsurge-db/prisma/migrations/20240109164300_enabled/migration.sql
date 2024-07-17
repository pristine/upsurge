-- AlterTable
ALTER TABLE "MessageCountAutomation" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MessageDropAutomation" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TimedDropAutomation" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;
