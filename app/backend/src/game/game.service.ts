import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ZGEG_DEV, type PlayerProfile, type GameList } from 'shared';
import { GameStateContext, WhoStartsPhase } from './GameStateContext';
import { SocialGateway } from '../social/social.gateway';

@Injectable()
export class GameService {
  private gameInstances: Map<string, GameStateContext> = new Map();
  private playersMap = new Map<string, string>(); //INFO: link playerId with a gameId

  constructor(private readonly socialGateway: SocialGateway) {}

  getGamesList(): GameList[] {
    const arrayOfGames = Array.from(this.gameInstances.values());
    return arrayOfGames.map((game: GameStateContext) => ({
      gameId: game.getGameId(),
      playerCount: game.getPlayers().size,
      state: 'pending players',
    }));
  }

  /**
   * @brief Create a new game and add the player to it
   * @param playerId - The user ID of the player to be added to the game
   */
  createGame(playerProfile: PlayerProfile) {
    if (this.playersMap.has(playerProfile.id)) {
      throw new ConflictException(
        `Player with id ${playerProfile.username} is already in a game`,
      );
    }
    const gameId = randomUUID();
    const game = new GameStateContext(gameId, new WhoStartsPhase());

    this.gameInstances.set(gameId, game);
    this.addPlayerToGame(gameId, playerProfile);
    console.log(`Game created with id ${gameId}`);
  }

  joinGame(playerProfile: PlayerProfile, gameId: string) {
    if (this.playersMap.has(playerProfile.id)) {
      throw new ConflictException(
        `Player with id ${playerProfile.username} is already in a game`,
      );
    }
    this.addPlayerToGame(gameId, playerProfile);
  }

  private getGameInstance(gameId: string): GameStateContext {
    const game = this.gameInstances.get(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    return game;
  }

  /**
   * @brief Find the game associated with a given player ID
   * @param playerId - The user ID of the player
   * @returns the Gamestate instance in which the player is located
   */
  getGameInstanceByUserId(playerId: string): GameStateContext {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      throw new NotFoundException(
        `Player with id ${playerId} is not in a game`,
      );
    }
    return this.gameInstances.get(gameId) as GameStateContext;
  }

  getGameId(playerId: string): string {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      throw new NotFoundException(
        `Player with id ${playerId} is not in a game`,
      );
    }
    return gameId;
  }

  /**
   * @brief Create a new instance of the Player class, initialise it and add it to both maps
   * @param gameId - The ID of the game to which the player will be added
   * @param playerId - The user ID of the player to be added to the game
   * @warning You need to check if the palyer is already in a game before calling this function
   */
  private addPlayerToGame(gameId: string, playerProfile: PlayerProfile) {
    const game = this.getGameInstance(gameId);
    this.playersMap.set(playerProfile.id, gameId);
    game
      .getPlayers()
      .set(playerProfile.username, game.initPlayer(playerProfile.username));
    this.socialGateway.handleGameList(this.getGamesList());

    //⚠️REMOVE in PROD -------------------
    console.log(`---------------------------------------
⚠️ The following is currently set in 'app/backend/src/game/game.service.ts':
- 'DEVMOD' (allow playing for others): enabled for '${playerProfile.username}'
- added mocked player '${ZGEG_DEV}' that will send requests in game,
disable his calls in 'app/backend/src/game/game.gateway.ts'
---------------------------------------`);
    game.setDEVMOD(playerProfile.username);
    game.getPlayers().set(`${ZGEG_DEV}`, game.initPlayer(`${ZGEG_DEV}`));
    // -----------------------------------
  }
}
