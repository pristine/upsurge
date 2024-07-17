/*
  Warnings:

  - Added the required column `channelId` to the `UserMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserMessage" ADD COLUMN     "channelId" TEXT NOT NULL;
