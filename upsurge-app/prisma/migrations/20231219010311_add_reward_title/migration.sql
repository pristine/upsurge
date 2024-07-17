/*
  Warnings:

  - You are about to drop the column `reward` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `description` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "reward",
ADD COLUMN     "description" TEXT NOT NULL;
