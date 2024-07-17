-- CreateTable
CREATE TABLE "WhopDiscordAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "discordToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhopDiscordAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhopDiscordAccess_id_key" ON "WhopDiscordAccess"("id");
