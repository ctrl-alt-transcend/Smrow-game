import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameState,
  Player,
  Ressources,
  GameLoopData

} from '../../shared/game/game.types';

@Injectable()
export class GameService {
  private games: Map<string, GameState> = new Map();

  createGame(): string {
    const gameId = randomUUID();

    this.games.set(gameId, { gameId: gameId, players: [], playerTurn: '' });
    return gameId;
  }

  findGame(gameId: string): GameState {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }

    return game;
  }

  addPlayerToGame(gameId: string, playerId: string): boolean {
    const game = this.findGame(gameId);
    game.players.push(this.createPlayer(playerId));
    return true;
  }

  private createPlayer(playerId: string): Player {
    return {
      playerId: playerId,
      ressources: {
        wood: 0,
        brick: 0,
        hay: 0,
        sheep: 0,
        rock: 0,
      },
      score: 0,
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

  private loopData: GameLoopData = {
    firstRoll: 0,
    secondRoll: 0,
    roadsBuilt: 0,
    settlementsBuilt: 0
  }

  rolledDice(): string {
    if(this.loopData.firstRoll == 0) {
      this.loopData.firstRoll = 1;
      return `First roll with a ${this.loopData.firstRoll}`;
    }
    if(this.loopData.secondRoll == 0) {
      this.loopData.secondRoll = 1;
      return `Second roll with a ${this.loopData.secondRoll}`;
    }
    return `You already rolled your dices, first [${this.loopData.firstRoll}], second [${this.loopData.secondRoll}]`;
  }

  buildRoad(): string {
    return 'You built a road !';
  }

  buildSettlement(): string {
    return 'You built a settlement !';
  }
}
