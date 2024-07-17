/*
  Warnings:

  - You are about to drop the column `primary` on the `Product` table. All the data in the column will be lost.
  - Added the required column `priamryProductId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "priamryProductId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "primary";
