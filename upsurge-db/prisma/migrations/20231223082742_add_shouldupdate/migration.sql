/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `WhopDiscordAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WhopDiscordAccess" ADD COLUMN     "shouldUpdate" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "WhopDiscordAccess_userId_key" ON "WhopDiscordAccess"("userId");
