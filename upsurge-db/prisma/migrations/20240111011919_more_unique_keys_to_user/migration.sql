/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id,serviceId,serviceType]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userServiceType` to the `PointActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userServiceType` to the `RedeemedReward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userServiceType` to the `UserMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointActivity" DROP CONSTRAINT "PointActivity_userId_userServiceId_fkey";

-- DropForeignKey
ALTER TABLE "RedeemedReward" DROP CONSTRAINT "RedeemedReward_userId_userServiceId_fkey";

-- DropForeignKey
ALTER TABLE "UserMessage" DROP CONSTRAINT "UserMessage_userId_userServiceId_fkey";

-- DropIndex
DROP INDEX "User_id_serviceId_key";

-- AlterTable
ALTER TABLE "PointActivity" ADD COLUMN     "userServiceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "RedeemedReward" ADD COLUMN     "userServiceType" "ServiceType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id", "serviceId", "serviceType");

-- AlterTable
ALTER TABLE "UserMessage" ADD COLUMN     "userServiceType" "ServiceType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_id_serviceId_serviceType_key" ON "User"("id", "serviceId", "serviceType");

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_userId_userServiceId_userServiceType_fkey" FOREIGN KEY ("userId", "userServiceId", "userServiceType") REFERENCES "User"("id", "serviceId", "serviceType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_userId_userServiceId_userServiceType_fkey" FOREIGN KEY ("userId", "userServiceId", "userServiceType") REFERENCES "User"("id", "serviceId", "serviceType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_userId_userServiceId_userServiceType_fkey" FOREIGN KEY ("userId", "userServiceId", "userServiceType") REFERENCES "User"("id", "serviceId", "serviceType") ON DELETE RESTRICT ON UPDATE CASCADE;
