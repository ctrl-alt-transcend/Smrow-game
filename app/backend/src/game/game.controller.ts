import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import type { PlayerProfile } from '@shared/game/game.types';
import type { UserPublic } from '@shared/types';
//import type { BuildDto } from './dto/build.dto';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createGame(@Req() req: { user: UserPublic }) {
    const playerProfile: PlayerProfile =
      await this.userService.findPlayerProfile(req.user.id);
    return this.gameService.createGame(playerProfile);
  }

  @Post('/join')
  @UseGuards(JwtAuthGuard)
  async joingame(
    @Req() req: { user: UserPublic },
    @Body('gameId') gameId: string,
  ) {
    const playerProfile: PlayerProfile =
      await this.userService.findPlayerProfile(req.user.id);
    return this.gameService.joinGame(playerProfile, gameId);
  }

  //TODO: check id this endpoint is needed ?
  // @Get('/currentGame')
  // @UseGuards(JwtAuthGuard)
  // async findGameByJwt(@Req() req: { user: UserPublic }): Promise<GameState> {
  //   return this.gameService.getGameStateByUserId(req.user.id);
  // };

  //TODO: Implement this with websockets
  //@Post('build')
  //async buildRequest(@Body() dto: BuildDto) {
  //  const result = this.gameService.buildRequest();
  //  return { ...result };
  //}

  //TODO: Implement this with websockets
  //@Post('dice')
  //async diceRequest(@Body() dto: RollDiceDto) {
  //  const result = this.gameService.diceRequest();
  //  return { ...result };
  //}
}
