import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameState,
  Player,
  GameResponse,
  PlayerProfile,
} from '@shared/game/game.types';
import {
  GameStateContext,
  StartingPhase
} from './GameStateContext';
import { initPlayer } from './game.utils';

@Injectable()
export class GameService {
  //private gamesMap: Map<string, GameState> = new Map();
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

    //this.gamesMap.set(gameId, { gameId: gameId, players: [], playerTurn: '', diceRoll: 0, masterLog: '...' }); // v.1
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

  // v.1
  //private getGameState(gameId: string): GameState  {
  //  const game = this.gamesMap.get(gameId);
  //  if (!game) {
  //    throw new Error(`Game with id ${gameId} not found`);
  //  }

  //  return game;
  //}

  // v.2
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
  //getGameStateByUserId(playerId: string): GameState { // v.1
  //  const gameId = this.playersMap.get(playerId);
  //  if (!gameId) {
  //    throw new NotFoundException(`Player with id ${playerId} is not in a game`);
  //  }
  //  return this.gamesMap.get(gameId) as GameState;
  //}

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

  /**
   * @brief Create a new instance of the Player class, initialise it and add it to both maps
   * @param gameId - The ID of the game to which the player will be added
   * @param playerId - The user ID of the player to be added to the game
   * @warning You need to check if the palyer is already in a game before calling this function
   */
  private addPlayerToGame(gameId: string, playerProfile: PlayerProfile) {
    //const game = this.getGameState(gameId); // v.1
    const game = this.getGameInstance(gameId);  // v.2

    this.playersMap.set(playerProfile.id, gameId);
    //game.players.push(this.createPlayer(playerProfile)); // v.1
    game.getPlayers().set(playerProfile.username, initPlayer(playerProfile.username));  // v.2
  }


  //private createPlayer(playerProfile: PlayerProfile): Player {
  //  return {
  //    playerId: playerProfile.id,
  //    score: 0,
  //    firstDice: 0,
  //    secondDice: 0,
  //    settlementsBuilt: 0,
  //    roadsBuilt: 0,
  //    ressources: {
  //      wood: 0,
  //      brick: 0,
  //      hay: 0,
  //      sheep: 0,
  //      rock: 0,
  //    },
  //    level: 1, //TODO: add a level system to the game
  //    username: playerProfile.username,
  //    avatarURL: playerProfile.avatarURL
  //    //color TODO: add color to player
  //  };
  //}

  // ⚠️ FOR TESTING ONLY!
  //game = new GameStateContext('test', new StartingPhase());

  //diceRequest( username: string ): { value: number | null, message: string | null } {
  //  let response: GameResponse = this.game.diceRequest(username);
  //  //let response: GameResponse = this.game.diceRequest('spagg');  // ⚠️ FOR TESTING ONLY! Replace by requesting player's ID
  //  //response = this.game.diceRequest('enriquest');                // ⚠️ FOR TESTING ONLY! Replace by requesting player's ID
  //  //this.game.phaseCheckRequest();
  //  return { value: response.value, message: response.message };
  //}

  //buildRequest( username: string ): { value: number | null, message: string | null } {
  //  let response: GameResponse = this.game.buildRequest(username);
  //  //let response: GameResponse = this.game.buildRequest('spagg'); // ⚠️ FOR TESTING ONLY! Replace by requesting player's ID
  //  //response = this.game.buildRequest('enriquest');               // ⚠️ FOR TESTING ONLY! Replace by requesting player's ID
  //  this.game.phaseCheckRequest();
  //  return { value: response.value, message: response.message };
  //}
}
