import { Controller, Post, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Post('/create_game')
  createGame(): string {
    return this.GameService.createGame();
  }

  @Get('dice')
  getDice() {
    return { message: this.GameService.rolledDice() };
  }

  @Get('road')
  getRoad() {
    return { message: this.GameService.buildRoad() };
  }

  @Get('settlement')
  getSettlement() {
    return { message: this.GameService.buildSettlement() };
  }
}
