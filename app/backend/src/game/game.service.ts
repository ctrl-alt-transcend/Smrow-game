import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { GameState, Player, Ressources } from '../../shared/game/game.types';

@Injectable()
export class GameService {
  private games: Map<string, GameState> = new Map();

  createGame(): string {
    const gameId = randomUUID();

    this.games.set(gameId, { gameId: gameId, players: [], playerTurn: '' });
    return gameId;
  }

  findGame(gameId: string): GameState  {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }

    return game;
  }

  addPlayerToGame(gameId: string, playerId: string): boolean {
    const game = this.findGame(gameId);
    game.players.push(this.createPlayer(playerId));
    return (true);
  }

  private createPlayer(playerId: string) : Player {
    return ({
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
    })
  }

  // private initGameState(gameId: string): GameState {
  // return(
  //   {
  //     gameId: gameId,
  //     players: [],
  //     playerTurn: "",
  //   });
  // }
}
