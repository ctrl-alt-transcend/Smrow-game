import { Controller, Post, UseGuards, Req, Body, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../user/user.service';
import {
  type PlayerProfile,
  type SettingsData,
  SettingsDataSchema,
  UserPublic,
  GameList,
} from 'shared';
import { ZodValidationPipe } from 'nestjs-zod';

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

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMyGame(@Req() req: { user: UserPublic }): { gameId: string | null } {
    try {
      return { gameId: this.gameService.getGameId(req.user.id) };
    } catch {
      return { gameId: null };
    }
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createGame(
    @Req() req: { user: UserPublic },
    @Body(new ZodValidationPipe(SettingsDataSchema)) body: SettingsData,
  ) {
    const playerProfile: PlayerProfile =
      await this.userService.findPlayerProfile(req.user.id);
    return this.gameService.createGame(playerProfile, body);
  }

  // /join inchangé — sauf si tu veux le même traitement :
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

  @Post('/quit')
  @UseGuards(JwtAuthGuard)
  quitGame(@Req() req: { user: UserPublic }) {
    const game = this.gameService.getGameInstanceByUserId(req.user.id);
    this.gameService.removePlayerFromGame(
      { id: req.user.id, username: req.user.name },
      game.getGameId(),
    );
  }
}
