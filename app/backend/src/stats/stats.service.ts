import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  GameResultSchema,
  type GameResult,
  type LeaderboardEntry,
  type MatchHistoryEntry,
  type PlayerStats,
} from 'shared';
import { computeAchievements, computeLevel, winRate } from './stats.rules';

@Injectable()
export class StatsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPlayerStats(userId: string): Promise<PlayerStats> {
    const [totals, wins] = await Promise.all([
      this.databaseService.gamesPlayer.aggregate({
        where: { userId },
        _count: { _all: true },
        _sum: {
          winPoints: true,
          settlementBuilt: true,
          citiesBuilt: true,
          devCardsBought: true,
        },
        _avg: { playerRank: true },
      }),
      this.databaseService.gamesPlayer.count({
        where: { userId, isWinner: true },
      }),
    ]);

    const gamesPlayed = totals._count._all;
    const summary = {
      gamesPlayed,
      wins,
      totalWinPoints: totals._sum.winPoints ?? 0,
      totalSettlements: totals._sum.settlementBuilt ?? 0,
      totalCities: totals._sum.citiesBuilt ?? 0,
      totalDevCards: totals._sum.devCardsBought ?? 0,
    };
    const averageRank = totals._avg.playerRank;

    return {
      ...summary,
      losses: gamesPlayed - wins,
      winRate: winRate(wins, gamesPlayed),
      averageRank:
        averageRank === null ? null : Math.round(averageRank * 10) / 10,
      level: computeLevel(summary),
      achievements: computeAchievements(summary),
    };
  }

  async getMatchHistory(
    userId: string,
    limit: number,
  ): Promise<MatchHistoryEntry[]> {
    const results = await this.databaseService.gamesPlayer.findMany({
      where: { userId },
      orderBy: { games: { playedAt: 'desc' } },
      take: limit,
      include: {
        games: {
          include: {
            players: {
              where: { userId: { not: userId } },
              orderBy: { playerRank: 'asc' },
              include: { user: { select: { username: true } } },
            },
          },
        },
      },
    });

    return results.map(({ games, ...me }) => ({
      gameId: games.id,
      playedAt: games.playedAt.toISOString(),
      totalTurns: games.totalTurns,
      isWinner: me.isWinner,
      playerRank: me.playerRank,
      winPoints: me.winPoints,
      opponents: games.players.map((p) => ({
        userId: p.userId,
        username: p.user.username,
        playerRank: p.playerRank,
        isWinner: p.isWinner,
      })),
    }));
  }

  /**
   * @brief: Players ordered by wins, then by win rate.
   *         Players with equal wins and win rate share the same rank.
   */
  async getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const winners = await this.databaseService.gamesPlayer.groupBy({
      by: ['userId'],
      where: { isWinner: true },
      _count: { _all: true },
      orderBy: { _count: { userId: 'desc' } },
      take: limit,
    });
    if (winners.length === 0) return [];

    const userIds = winners.map((w) => w.userId);
    const [played, users] = await Promise.all([
      this.databaseService.gamesPlayer.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true },
      }),
      this.databaseService.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          username: true,
          profile: { select: { avatarURL: true } },
        },
      }),
    ]);
    const playedBy = new Map(played.map((p) => [p.userId, p._count._all]));
    const userBy = new Map(users.map((u) => [u.id, u]));

    const entries = winners
      .map((w) => {
        const gamesPlayed = playedBy.get(w.userId) ?? 0;
        const user = userBy.get(w.userId);
        return {
          userId: w.userId,
          username: user?.username ?? 'Unknown',
          avatarURL: user?.profile?.avatarURL ?? null,
          wins: w._count._all,
          gamesPlayed,
          winRate: winRate(w._count._all, gamesPlayed),
        };
      })
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);

    let rank = 0;
    return entries.map((entry, i) => {
      const prev = entries[i - 1];
      const tied =
        prev && prev.wins === entry.wins && prev.winRate === entry.winRate;
      if (!tied) rank = i + 1;
      return { rank, ...entry };
    });
  }

  /**
   * @brief:   Single entry point to save a finished game.
   * @details: To be called by the game once it is over. Creates the game and
   *           every player result at once, so stats, history, achievements and
   *           leaderboard are updated without any other change.
   *           Only real users can be recorded (userId must exist).
   */
  async recordGameResult(input: GameResult) {
    const parsed = GameResultSchema.safeParse(input);
    if (!parsed.success)
      throw new BadRequestException(
        parsed.error.issues.map((i) => i.message).join(', '),
      );
    const result = parsed.data;

    const userIds = result.players.map((p) => p.userId);
    const knownUsers = await this.databaseService.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });
    if (knownUsers.length !== userIds.length) {
      const known = new Set(knownUsers.map((u) => u.id));
      const unknown = userIds.filter((id) => !known.has(id));
      throw new BadRequestException(`Unknown users: ${unknown.join(', ')}`);
    }

    return this.databaseService.games.create({
      data: {
        totalTurns: result.totalTurns,
        playedAt: result.playedAt ? new Date(result.playedAt) : undefined,
        players: {
          createMany: {
            data: result.players.map((p) => ({
              userId: p.userId,
              turnOrder: p.turnOrder,
              winPoints: p.winPoints,
              isWinner: p.isWinner,
              playerRank: p.playerRank,
              settlementBuilt: p.settlementBuilt,
              citiesBuilt: p.citiesBuilt,
              devCardsBought: p.devCardsBought,
            })),
          },
        },
      },
      include: { players: true },
    });
  }
}
