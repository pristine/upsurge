/*
  Warnings:

  - You are about to drop the column `amount` on the `MessageDropAutomation` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `TimedDropAutomation` table. All the data in the column will be lost.
  - Added the required column `amountLowerBounds` to the `MessageDropAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountUpperBounds` to the `MessageDropAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountLowerBounds` to the `TimedDropAutomation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountUpperBounds` to the `TimedDropAutomation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageDropAutomation" DROP COLUMN "amount",
ADD COLUMN     "amountLowerBounds" INTEGER NOT NULL,
ADD COLUMN     "amountUpperBounds" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TimedDropAutomation" DROP COLUMN "amount",
ADD COLUMN     "amountLowerBounds" INTEGER NOT NULL,
ADD COLUMN     "amountUpperBounds" INTEGER NOT NULL;
