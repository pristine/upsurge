/*
  Warnings:

  - You are about to drop the `_ProductToProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `GroupId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ProductToProduct" DROP CONSTRAINT "_ProductToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProduct" DROP CONSTRAINT "_ProductToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "GroupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ProductToProduct";

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
