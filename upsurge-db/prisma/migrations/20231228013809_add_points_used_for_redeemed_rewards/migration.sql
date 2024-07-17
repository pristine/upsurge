/*
  Warnings:

  - Added the required column `pointsUsed` to the `RedeemedReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RedeemedReward" ADD COLUMN     "pointsUsed" INTEGER NOT NULL;
