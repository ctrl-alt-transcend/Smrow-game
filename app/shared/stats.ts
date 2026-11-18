import { z } from "zod";
import { DatetimeSchema, IdSchema } from "./types.js";

// ----- Write contract -----
// What the game must provide once a game is over.
// See StatsService.recordGameResult in the backend.

const CountSchema = z.number().int().nonnegative();

export const GameResultPlayerSchema = z.object({
  userId: IdSchema,
  turnOrder: CountSchema,
  winPoints: CountSchema,
  isWinner: z.boolean(),
  playerRank: z.number().int().min(1, "playerRank starts at 1"),
  settlementBuilt: CountSchema,
  citiesBuilt: CountSchema,
  devCardsBought: CountSchema,
});
export type GameResultPlayer = z.infer<typeof GameResultPlayerSchema>;

const isUnique = (values: unknown[]) => new Set(values).size === values.length;

export const GameResultSchema = z
  .object({
    totalTurns: CountSchema,
    duration: CountSchema.optional(), // seconds
    playedAt: DatetimeSchema.optional(), // ISO date, defaults to now
    players: z
      .array(GameResultPlayerSchema)
      .min(1, "A game result needs at least one player"),
  })
  .superRefine(({ players }, ctx) => {
    if (!isUnique(players.map((p) => p.userId)))
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: "A player can only appear once per game",
      });
    if (!isUnique(players.map((p) => p.turnOrder)))
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: "turnOrder must be unique per game",
      });
    players.forEach((p, i) => {
      // the winner may be missing if a non-recorded player (bot) won
      if (p.isWinner !== (p.playerRank === 1))
        ctx.addIssue({
          code: "custom",
          path: ["players", i, "isWinner"],
          message: "Only the rank 1 player is the winner",
        });
    });
  });
export type GameResult = z.infer<typeof GameResultSchema>;

// ----- Read responses -----

export type Achievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  progress: number; // current value
  goal: number; // value needed to unlock
};

export type PlayerLevel = {
  level: number;
  xp: number;
  currentLevelXp: number; // xp needed to reach the current level
  nextLevelXp: number; // xp needed to reach the next level
};

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // 0 to 100
  averageRank: number | null;
  totalWinPoints: number;
  totalSettlements: number;
  totalCities: number;
  totalDevCards: number;
  level: PlayerLevel;
  achievements: Achievement[];
};

export type MatchOpponent = {
  userId: string;
  username: string;
  playerRank: number;
  isWinner: boolean;
};

export type MatchHistoryEntry = {
  gameId: string;
  playedAt: string;
  duration: number | null;
  totalTurns: number;
  isWinner: boolean;
  playerRank: number;
  winPoints: number;
  opponents: MatchOpponent[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarURL: string | null;
  wins: number;
  gamesPlayed: number;
  winRate: number; // 0 to 100
};
