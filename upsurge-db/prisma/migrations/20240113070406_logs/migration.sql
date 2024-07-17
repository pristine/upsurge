-- CreateEnum
CREATE TYPE "LogFocus" AS ENUM ('points', 'rewards', 'users', 'redeemedRewards', 'automations');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "logChannel" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "focus" "LogFocus" NOT NULL,
    "content" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Log_id_key" ON "Log"("id");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
