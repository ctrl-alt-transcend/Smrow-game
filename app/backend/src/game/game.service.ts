import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameState,
  Player,
  RollResponse,
  PlayerProfile,
} from '@shared/game/game.types';
import {
  GameStateContext,
  RessourcePhase
} from './GameStateContext';

@Injectable()
export class GameService {
  private gamesMap: Map<string, GameState> = new Map();
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

    this.gamesMap.set(gameId, { gameId: gameId, players: [], playerTurn: '', diceRoll: 0, masterLog: '' });
    this.addPlayerToGame(gameId, playerProfile);
    console.log(`Game created with id ${gameId}`);
  }

  joinGame(playerProfile: PlayerProfile, gameId: string) {
    if (this.playersMap.has(playerProfile.id)) {
      throw new ConflictException(`Player with id ${playerProfile.username} is already in a game`);
    }
    this.addPlayerToGame(gameId, playerProfile);
  }

  private getGameState(gameId: string): GameState  {
    const game = this.gamesMap.get(gameId);
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
  getGameStateByUserId(playerId: string): GameState {
    const gameId = this.playersMap.get(playerId);
    if (!gameId) {
      throw new NotFoundException(`Player with id ${playerId} is not in a game`);
    }
    return this.gamesMap.get(gameId) as GameState;
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
    const game = this.getGameState(gameId);

    this.playersMap.set(playerProfile.id, gameId);
    game.players.push(this.createPlayer(playerProfile));
  }


  private createPlayer(playerProfile: PlayerProfile): Player {
    return {
      playerId: playerProfile.id,
      score: 0,
      firstDice: 0,
      secondDice: 0,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      ressources: {
        wood: 0,
        brick: 0,
        hay: 0,
        sheep: 0,
        rock: 0,
      },
      level: 1, //TODO: add a level system to the game
      username: playerProfile.username,
      avatarURL: playerProfile.avatarURL
      //color TODO: add color to player
    };
  }

  // private initGameState(gameId: string): GameState {
  // return(
  //   {
  //     gameId: gameId,
  //     players: [],
  //     playerTurn: "",
  //   });
  // }

  // --------------------------------
  game = new GameStateContext(new RessourcePhase());

  rollDice(): { value: number | null , message: string | null } {
    let response: RollResponse = this.game.request1();
    //this.game.request2();
    return { value: response.value, message: response.message };
  }

  //getLoopData(): GameLoopData {
  //  return { ...this.loopData };
  //}

  //buildRoad(): string {
  //  //if(this.phase.)
  //  if(this.tst_plyr.firstDice && this.tst_plyr.firstDice) {
  //    this.tst_plyr.firstDice = 0;
  //    this.tst_plyr.secondDice = 0;
  //  }
  //  this.loopData.roadsBuilt++;
  //  return `You built your #${this.loopData.roadsBuilt}th road !`;
  //}

  //buildSettlement(): string {
  //  //this.phase.request1(this.tst_plyr);
  //  //this.phase.request2();
  //  //this.phase.request2();
  //  if(this.tst_plyr.firstDice && this.tst_plyr.firstDice) {
  //    this.tst_plyr.firstDice = 0;
  //    this.tst_plyr.secondDice = 0;
  //  }
  //  this.loopData.settlementsBuilt++;
  //  return `You built your #${this.loopData.settlementsBuilt}th settlement !`;
  //}

}
