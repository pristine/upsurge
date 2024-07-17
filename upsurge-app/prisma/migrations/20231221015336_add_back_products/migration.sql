/*
  Warnings:

  - Added the required column `companyWhopId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_companyId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "companyWhopId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_companyId_companyWhopId_fkey" FOREIGN KEY ("companyId", "companyWhopId") REFERENCES "Company"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;
