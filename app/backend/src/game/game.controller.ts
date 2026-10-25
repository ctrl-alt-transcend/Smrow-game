import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { GameState } from '../../shared/game/game.types';
import type { UserPublic } from '../../shared/types';
import type { RollDiceDto } from './dto/roll-dice.dto';
import type { BuildDto } from './dto/build.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createGame(@Req() req: { user: UserPublic })  {
    return this.gameService.createGame(req.user.id);
  }

  @Post('/join')
  @UseGuards(JwtAuthGuard)
  async joingame(@Req() req: { user: UserPublic }, @Body('gameId') gameId: string) {
    return this.gameService.joinGame(req.user.id, gameId);
  }

  @Get('/currentGame')
  @UseGuards(JwtAuthGuard)
  async findGameByJwt(@Req() req: { user: UserPublic }): Promise<GameState> {
    return this.gameService.getGameStateByUserId(req.user.id);
  };

  @Post('build')
  async buildRequest(@Body() dto: BuildDto) {
    const result = this.gameService.buildRequest();
    return { ...result };
  }

  @Post('dice')
  async diceRequest(@Body() dto: RollDiceDto) {
    const result = this.gameService.diceRequest();
    return { ...result };
  }

}
