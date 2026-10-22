import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import type { GameState, PlayerProfile } from '@shared/game/game.types';
import type { UserPublic } from '@shared/types';
import type { RollDiceDto } from './dto/roll-dice.dto';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createGame(@Req() req: { user: UserPublic })  {
    const playerProfile: PlayerProfile = await this.userService.findPlayerProfile(req.user.id);
    return this.gameService.createGame(playerProfile);
  }

  @Post('/join')
  @UseGuards(JwtAuthGuard)
  async joingame(@Req() req: { user: UserPublic }, @Body('gameId') gameId: string) {
    const playerProfile: PlayerProfile = await this.userService.findPlayerProfile(req.user.id);
    return this.gameService.joinGame(playerProfile, gameId);
  }

  @Get('/currentGame')
  @UseGuards(JwtAuthGuard)
  async findGameByJwt(@Req() req: { user: UserPublic }): Promise<GameState> {
    return this.gameService.getGameStateByUserId(req.user.id);
  };

  //@Get('road')
  //getRoad() {
  //  return { message: this.GameService.buildRoad() };
  //}

  //@Get('settlement')
  //getSettlement() {
  //  return { message: this.GameService.buildSettlement() };
  //}

  @Post('dice/roll')
  async rollDice(@Body() dto: RollDiceDto) {
    const result = this.gameService.rollDice();
    return { ...result };
  }

}
