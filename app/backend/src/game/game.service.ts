import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { PlayerProfile, GameDataDto } from '@shared/game/game.types';
import {
  GameStateContext,
  StartingPhase,
} from './GameStateContext';

@Injectable()
export class GameService {
  private gameInstances: Map<string, GameStateContext> = new Map();
  private playersMap = new Map<string, string>(); //INFO: link playerId with a gameId

  /**
   * @brief Create a new game and add the player to it
   * @param playerId - The user ID of the player to be added to the game
   */
  createGame(playerProfile: PlayerProfile) {
    if (this.playersMap.has(playerProfile.id)) {
      throw new ConflictException(`Player with id ${playerProfile.username} is already in a game`);
    }
    const gameId = randomUUID();

    this.gameInstances.set(gameId, new GameStateContext(gameId, new StartingPhase()));  // v.2
    this.addPlayerToGame(gameId, playerProfile);
    console.log(`Game created with id ${gameId}`);
  }

  joinGame(playerProfile: PlayerProfile, gameId: string) {
    if (this.playersMap.has(playerProfile.id)) {
      throw new ConflictException(`Player with id ${playerProfile.username} is already in a game`);
    }
    this.addPlayerToGame(gameId, playerProfile);
  }

  private getGameInstance(gameId: string): GameStateContext  {
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
      throw new NotFoundException(`Player with id ${playerId} is not in a game`);
    }
    return this.gameInstances.get(gameId) as GameStateContext;
  }

  getGameId(playerId: string): string {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      throw new NotFoundException(`Player with id ${playerId} is not in a game`);
    }
    return gameId;
  }

  getGames(): GameDataDto[] {
    return Array.from(this.gameInstances.values()).map((game: GameStateContext ) => game.getGameDataDto());
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
    game.getPlayers().set(playerProfile.username, game.initPlayer(playerProfile.username));
  }
}
