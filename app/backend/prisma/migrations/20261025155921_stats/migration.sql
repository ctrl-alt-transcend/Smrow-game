/*
  Warnings:

  - Added the required column `playerRank` to the `GamesPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GamesPlayer" ADD COLUMN     "playerRank" INTEGER NOT NULL;
