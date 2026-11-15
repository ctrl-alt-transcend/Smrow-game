import { Controller, Post, UseGuards, Req, Body, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import type { PlayerProfile, UserPublic, GameList } from 'shared';
//import type { BuildDto } from './dto/build.dto';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  getGamesList(): GameList[] {
    return this.gameService.getGamesList();
  }

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
}
