/*
  Warnings:

  - You are about to drop the column `pointsActivity` on the `UserProductBridge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProductBridge" DROP COLUMN "pointsActivity";

-- CreateTable
CREATE TABLE "PointsActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "by" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointsActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PointsActivity_id_key" ON "PointsActivity"("id");

-- AddForeignKey
ALTER TABLE "PointsActivity" ADD CONSTRAINT "PointsActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProductBridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
