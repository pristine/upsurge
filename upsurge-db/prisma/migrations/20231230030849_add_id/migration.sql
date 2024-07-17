/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `userServiceId` to the `PointActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userServiceId` to the `RedeemedReward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointActivity" DROP CONSTRAINT "PointActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "RedeemedReward" DROP CONSTRAINT "RedeemedReward_userId_fkey";

-- AlterTable
ALTER TABLE "PointActivity" ADD COLUMN     "userServiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RedeemedReward" ADD COLUMN     "userServiceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id", "serviceId");

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_userId_userServiceId_fkey" FOREIGN KEY ("userId", "userServiceId") REFERENCES "User"("id", "serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointActivity" ADD CONSTRAINT "PointActivity_userId_userServiceId_fkey" FOREIGN KEY ("userId", "userServiceId") REFERENCES "User"("id", "serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
