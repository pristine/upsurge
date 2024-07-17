-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('MessageCount', 'Time');

-- CreateTable
CREATE TABLE "MessageCountAutomation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,

    CONSTRAINT "MessageCountAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageCountAutomation_serviceId_serviceType_key" ON "MessageCountAutomation"("serviceId", "serviceType");

-- AddForeignKey
ALTER TABLE "MessageCountAutomation" ADD CONSTRAINT "MessageCountAutomation_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
