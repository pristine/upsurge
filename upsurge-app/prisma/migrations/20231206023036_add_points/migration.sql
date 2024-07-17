/*
  Warnings:

  - Added the required column `pointsRequired` to the `RedemedRewards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RedemedRewards" ADD COLUMN     "pointsRequired" INTEGER NOT NULL;
