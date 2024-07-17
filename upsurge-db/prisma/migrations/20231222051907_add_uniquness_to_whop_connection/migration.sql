/*
  Warnings:

  - You are about to drop the column `companyId` on the `WhopConnection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[whopId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "WhopConnection" DROP CONSTRAINT "WhopConnection_companyId_fkey";

-- DropIndex
DROP INDEX "WhopConnection_companyId_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "whopId" TEXT;

-- AlterTable
ALTER TABLE "WhopConnection" DROP COLUMN "companyId";

-- CreateIndex
CREATE UNIQUE INDEX "Company_whopId_key" ON "Company"("whopId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_whopId_fkey" FOREIGN KEY ("whopId") REFERENCES "WhopConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
