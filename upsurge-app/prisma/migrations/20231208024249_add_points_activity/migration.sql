/*
  Warnings:

  - You are about to drop the column `pointsActivity` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "pointsActivity";

-- AlterTable
ALTER TABLE "UserProductBridge" ADD COLUMN     "pointsActivity" JSONB[];
