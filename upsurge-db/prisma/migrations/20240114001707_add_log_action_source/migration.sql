/*
  Warnings:

  - You are about to drop the column `actionType` on the `Log` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LogActionSource" AS ENUM ('user', 'admin');

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "actionType",
ADD COLUMN     "actionSource" "LogActionSource";

-- DropEnum
DROP TYPE "LogActionType";
