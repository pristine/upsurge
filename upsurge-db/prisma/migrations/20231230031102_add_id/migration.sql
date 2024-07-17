/*
  Warnings:

  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serviceId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceType` to the `PointActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `RedeemedReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointActivity" DROP CONSTRAINT "PointActivity_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "RedeemedReward" DROP CONSTRAINT "RedeemedReward_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_serviceId_fkey";

-- DropIndex
DROP INDEX "Service_id_key";

-- AlterTable
ALTER TABLE "PointActivity" ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "RedeemedReward" ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
DROP COLUMN "serviceId",
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id", "type");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "serviceType" "ServiceType" NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_serviceId_serviceType_fkey" FOREIGN KEY ("serviceId", "serviceType") REFERENCES "Service"("id", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
