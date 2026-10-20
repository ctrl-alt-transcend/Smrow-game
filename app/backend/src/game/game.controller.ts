import { Controller, Post, Get, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { RollDiceDto } from './dto/roll-dice.dto';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Post('/create_game')
  createGame(): string {
    return this.GameService.createGame();
  }

  @Get('road')
  getRoad() {
    return { message: this.GameService.buildRoad() };
  }

  @Get('settlement')
  getSettlement() {
    return { message: this.GameService.buildSettlement() };
  }

   @Post('dice/roll')
  async rollDice(@Body() dto: RollDiceDto) {
    const result = this.GameService.rollDice();
    return { ...result };
  }

  @Get('dice/stats')
  getStats() {
    return this.GameService.getLoopData();
  }
}
