/*
  Warnings:

  - You are about to drop the `PrimaryProductDiscord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RedemedRewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToReward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `discordServerId` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GroupId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `GroupId` to the `UserProductBridge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductId` to the `UserProductBridge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PrimaryProductDiscord" DROP CONSTRAINT "PrimaryProductDiscord_productId_productWhopId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_GroupId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_companyId_companyWhopId_fkey";

-- DropForeignKey
ALTER TABLE "RedemedRewards" DROP CONSTRAINT "RedemedRewards_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "RedemedRewards" DROP CONSTRAINT "RedemedRewards_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProductBridge" DROP CONSTRAINT "UserProductBridge_productId_productWhopId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToReward" DROP CONSTRAINT "_ProductToReward_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToReward" DROP CONSTRAINT "_ProductToReward_B_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "discordServerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "GroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProductBridge" ADD COLUMN     "GroupId" TEXT NOT NULL,
ADD COLUMN     "ProductId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PrimaryProductDiscord";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "RedemedRewards";

-- DropTable
DROP TABLE "_ProductToReward";

-- CreateTable
CREATE TABLE "RedeemedRewards" (
    "id" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "pointsRequired" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedeemedRewards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RedeemedRewards" ADD CONSTRAINT "RedeemedRewards_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemedRewards" ADD CONSTRAINT "RedeemedRewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProductBridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProductBridge" ADD CONSTRAINT "UserProductBridge_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
