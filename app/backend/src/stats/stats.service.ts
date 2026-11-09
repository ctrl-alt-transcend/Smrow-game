import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { GameResult } from 'shared';

@Injectable()
export class StatsService {
  constructor(private readonly databaseService: DatabaseService) {}

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
