-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "productLimit" INTEGER NOT NULL DEFAULT 0,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id","whopId")
);

-- CreateTable
CREATE TABLE "PrimaryProductDiscord" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productWhopId" TEXT NOT NULL,
    "discordServerId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrimaryProductDiscord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrimaryUserDiscord" (
    "id" TEXT NOT NULL,
    "userProductBridgeId" TEXT NOT NULL,
    "discordServerId" TEXT NOT NULL,
    "discordUserId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrimaryUserDiscord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "discordServerId" TEXT,
    "companyId" TEXT NOT NULL,
    "companyWhopId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedemedRewards" (
    "id" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedemedRewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyWhopId" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "whopId" TEXT NOT NULL,
    "discordId" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id","whopId")
);

-- CreateTable
CREATE TABLE "UserProductBridge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userWhopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productWhopId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProductBridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToReward" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_id_key" ON "Company"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_whopId_key" ON "Company"("whopId");

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryProductDiscord_discordServerId_key" ON "PrimaryProductDiscord"("discordServerId");

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryProductDiscord_productId_productWhopId_key" ON "PrimaryProductDiscord"("productId", "productWhopId");

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryUserDiscord_userProductBridgeId_key" ON "PrimaryUserDiscord"("userProductBridgeId");

-- CreateIndex
CREATE UNIQUE INDEX "PrimaryUserDiscord_discordServerId_discordUserId_key" ON "PrimaryUserDiscord"("discordServerId", "discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "Product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_whopId_key" ON "Product"("whopId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_whopId_key" ON "Product"("id", "whopId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_id_key" ON "Reward"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_whopId_key" ON "User"("whopId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProductBridge_id_key" ON "UserProductBridge"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProductBridge_userWhopId_productWhopId_key" ON "UserProductBridge"("userWhopId", "productWhopId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProduct_AB_unique" ON "_ProductToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProduct_B_index" ON "_ProductToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToReward_AB_unique" ON "_ProductToReward"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToReward_B_index" ON "_ProductToReward"("B");

-- AddForeignKey
ALTER TABLE "PrimaryProductDiscord" ADD CONSTRAINT "PrimaryProductDiscord_productId_productWhopId_fkey" FOREIGN KEY ("productId", "productWhopId") REFERENCES "Product"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrimaryUserDiscord" ADD CONSTRAINT "PrimaryUserDiscord_userProductBridgeId_fkey" FOREIGN KEY ("userProductBridgeId") REFERENCES "UserProductBridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_companyWhopId_fkey" FOREIGN KEY ("companyId", "companyWhopId") REFERENCES "Company"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedemedRewards" ADD CONSTRAINT "RedemedRewards_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedemedRewards" ADD CONSTRAINT "RedemedRewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProductBridge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_companyId_companyWhopId_fkey" FOREIGN KEY ("companyId", "companyWhopId") REFERENCES "Company"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProductBridge" ADD CONSTRAINT "UserProductBridge_productId_productWhopId_fkey" FOREIGN KEY ("productId", "productWhopId") REFERENCES "Product"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProductBridge" ADD CONSTRAINT "UserProductBridge_userId_userWhopId_fkey" FOREIGN KEY ("userId", "userWhopId") REFERENCES "User"("id", "whopId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProduct" ADD CONSTRAINT "_ProductToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProduct" ADD CONSTRAINT "_ProductToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToReward" ADD CONSTRAINT "_ProductToReward_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToReward" ADD CONSTRAINT "_ProductToReward_B_fkey" FOREIGN KEY ("B") REFERENCES "Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
