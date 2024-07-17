/*
  Warnings:

  - Changed the type of `type` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('discord');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('add', 'subtract');

-- CreateEnum
CREATE TYPE "ActivityReason" AS ENUM ('system', 'admin', 'reward');

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "type",
ADD COLUMN     "type" "ServiceType" NOT NULL;

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "PointActivity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "reason" "ActivityReason" NOT NULL,
    "points" INTEGER NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedRewardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointActivity_id_key" ON "PointActivity"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PointActivity_redeemedRewardId_key" ON "PointActivity"("redeemedRewardId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_id_type_key" ON "Service"("id", "type");

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_redeemedRewardId_fkey" FOREIGN KEY ("redeemedRewardId") REFERENCES "RedeemedReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
