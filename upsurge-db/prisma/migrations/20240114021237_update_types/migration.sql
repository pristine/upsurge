/*
  Warnings:

  - The values [rewardInactive,redeemedRewardProcess] on the enum `LogAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogAction_new" AS ENUM ('pointsGive', 'pointsRemove', 'rewardCreate', 'rewardUpdate', 'redemeedRewardsCreate', 'redeemedRewardUpdate', 'messageCountAutomationUpdate', 'messageDropAutomationUpdate', 'logChannelUpdate', 'mainChannelUpdate', 'rolesUpdate');
ALTER TABLE "Log" ALTER COLUMN "action" TYPE "LogAction_new" USING ("action"::text::"LogAction_new");
ALTER TYPE "LogAction" RENAME TO "LogAction_old";
ALTER TYPE "LogAction_new" RENAME TO "LogAction";
DROP TYPE "LogAction_old";
COMMIT;
