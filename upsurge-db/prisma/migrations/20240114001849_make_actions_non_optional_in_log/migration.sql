/*
  Warnings:

  - Made the column `action` on table `Log` required. This step will fail if there are existing NULL values in that column.
  - Made the column `actionSource` on table `Log` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "action" SET NOT NULL,
ALTER COLUMN "actionSource" SET NOT NULL;
