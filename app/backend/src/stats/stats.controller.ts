import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type {
  LeaderboardEntry,
  MatchHistoryEntry,
  PlayerStats,
  UserPublic,
} from 'shared';

const MAX_LIMIT = 50;
const clamp = (limit: number) => Math.min(Math.max(limit, 1), MAX_LIMIT);

/**
 * @brief: Read only. Game results are written by the game itself through
 *         StatsService.recordGameResult, never from the client.
 */
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  async me(@Req() req: { user: UserPublic }): Promise<PlayerStats> {
    return this.statsService.getPlayerStats(req.user.id);
  }

  @Get('me/history')
  async myHistory(
    @Req() req: { user: UserPublic },
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<MatchHistoryEntry[]> {
    return this.statsService.getMatchHistory(req.user.id, clamp(limit));
  }

  @Get('leaderboard')
  async leaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<LeaderboardEntry[]> {
    return this.statsService.getLeaderboard(clamp(limit));
  }
}
