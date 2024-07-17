/*
  Warnings:

  - Added the required column `userId` to the `RedeemedReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RedeemedReward" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RedeemedReward" ADD CONSTRAINT "RedeemedReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
