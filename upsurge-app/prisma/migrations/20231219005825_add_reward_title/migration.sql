/*
  Warnings:

  - Added the required column `title` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "title" TEXT NOT NULL;
