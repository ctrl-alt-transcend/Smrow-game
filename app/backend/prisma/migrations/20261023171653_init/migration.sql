-- CreateTable
CREATE TABLE "Games" (
    "id" TEXT NOT NULL,
    "totalTurns" INTEGER NOT NULL,
    "duration" INTEGER,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamesPlayer" (
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "turnOrder" INTEGER NOT NULL,
    "winPoints" INTEGER NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "settlementBuilt" INTEGER NOT NULL,
    "citiesBuilt" INTEGER NOT NULL,
    "devCardsBought" INTEGER NOT NULL,

    CONSTRAINT "GamesPlayer_pkey" PRIMARY KEY ("gameId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamesPlayer_gameId_turnOrder_key" ON "GamesPlayer"("gameId", "turnOrder");

-- AddForeignKey
ALTER TABLE "GamesPlayer" ADD CONSTRAINT "GamesPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamesPlayer" ADD CONSTRAINT "GamesPlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
