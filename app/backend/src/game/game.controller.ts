import { Controller, Post, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Post('/create_game')
  createGame() : string {
    return this.GameService.createGame();
  }

}
