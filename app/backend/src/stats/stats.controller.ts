import { Controller } from '@nestjs/common';
import { StatsService } from './stats.service';

/**
 * @brief: Read only. Game results are written by the game itself through
 *         StatsService.recordGameResult, never from the client.
 */
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}
}
