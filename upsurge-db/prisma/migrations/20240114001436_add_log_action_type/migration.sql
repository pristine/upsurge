-- CreateEnum
CREATE TYPE "LogActionType" AS ENUM ('user', 'admin');

-- AlterEnum
ALTER TYPE "LogAction" ADD VALUE 'redemeedRewardsCreate';

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "actionType" "LogActionType";
