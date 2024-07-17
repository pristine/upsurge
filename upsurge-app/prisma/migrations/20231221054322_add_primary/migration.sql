/*
  Warnings:

  - You are about to drop the `PrimaryUserDiscord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrimaryUserDiscord" DROP CONSTRAINT "PrimaryUserDiscord_userProductBridgeId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "primary" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "PrimaryUserDiscord";
