/*
  Warnings:

  - You are about to drop the column `GroupId` on the `UserProductBridge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserProductBridge" DROP CONSTRAINT "UserProductBridge_GroupId_fkey";

-- AlterTable
ALTER TABLE "UserProductBridge" DROP COLUMN "GroupId";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyWhopId" TEXT NOT NULL,
    "GroupId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "Product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_whopId_key" ON "Product"("whopId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_whopId_key" ON "Product"("id", "whopId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_companyWhopId_fkey" FOREIGN KEY ("companyId", "companyWhopId") REFERENCES "Company"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_GroupId_fkey" FOREIGN KEY ("GroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProductBridge" ADD CONSTRAINT "UserProductBridge_productId_productWhopId_fkey" FOREIGN KEY ("productId", "productWhopId") REFERENCES "Product"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;
