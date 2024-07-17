-- CreateEnum
CREATE TYPE "Type" AS ENUM ('DISCORD');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhopConnection" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "WhopConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedeemedReward" (
    "id" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,

    CONSTRAINT "RedeemedReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_id_key" ON "Company"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhopConnection_id_key" ON "WhopConnection"("id");

-- CreateIndex
CREATE UNIQUE INDEX "WhopConnection_companyId_key" ON "WhopConnection"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_id_type_key" ON "Service"("id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_serviceId_key" ON "User"("id", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_id_key" ON "Reward"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RedeemedReward_id_key" ON "RedeemedReward"("id");

-- AddForeignKey
ALTER TABLE "WhopConnection" ADD CONSTRAINT "WhopConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
