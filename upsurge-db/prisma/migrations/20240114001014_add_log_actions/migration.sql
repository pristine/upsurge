-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('pointsGive', 'pointsRemove', 'rewardCreate', 'rewardEdit', 'rewardInactive', 'redeemedRewardProcess', 'automationsEdit');

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "action" "LogAction";
