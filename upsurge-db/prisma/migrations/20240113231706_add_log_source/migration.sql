/*
  Warnings:

  - Added the required column `source` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LogSource" AS ENUM ('discord', 'telegram', 'web');

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "source" "LogSource" NOT NULL;
