import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  GameResult,
  LeaderboardEntry,
  MatchHistoryEntry,
  PlayerStats,
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
      duration: games.duration,
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
  async recordGameResult(result: GameResult) {
    this.validateGameResult(result);

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
        duration: result.duration ?? null,
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

  private validateGameResult(result: GameResult) {
    const { players } = result;
    const isCount = (n: unknown) => Number.isInteger(n) && (n as number) >= 0;

    if (!Array.isArray(players) || players.length === 0)
      throw new BadRequestException('A game result needs at least one player');
    if (!isCount(result.totalTurns))
      throw new BadRequestException('totalTurns must be a positive integer');
    if (result.duration !== undefined && !isCount(result.duration))
      throw new BadRequestException('duration must be a positive integer');
    if (result.playedAt && isNaN(Date.parse(result.playedAt)))
      throw new BadRequestException('playedAt must be an ISO date');

    const unique = (values: unknown[]) =>
      new Set(values).size === values.length;
    if (!unique(players.map((p) => p.userId)))
      throw new BadRequestException('A player can only appear once per game');
    if (!unique(players.map((p) => p.turnOrder)))
      throw new BadRequestException('turnOrder must be unique per game');

    for (const p of players) {
      const counters = [
        p.turnOrder,
        p.winPoints,
        p.settlementBuilt,
        p.citiesBuilt,
        p.devCardsBought,
      ];
      if (!counters.every(isCount))
        throw new BadRequestException(
          `Invalid counters for player ${p.userId}`,
        );
      if (!Number.isInteger(p.playerRank) || p.playerRank < 1)
        throw new BadRequestException('playerRank starts at 1');
      // the winner may be missing if a non-recorded player (bot) won
      if (p.isWinner !== (p.playerRank === 1))
        throw new BadRequestException('Only the rank 1 player is the winner');
    }
  }
}
