import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameState,
  Player,
  Ressources,
  RollResponse
} from '../../shared/game/game.types';
import {
  GameStateContext,
  StartingPhase,
  RessourcePhase,
  TradeAndBuildPhase
} from './GameStateContext';

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

  // "hardcoded" for tetsing purpose
  private tst_inventory: Ressources = {
    wood: 0,
    brick: 0,
    hay: 0,
    sheep: 0,
    rock: 0
  }

  //private tst_plyr: Player = {
  //  playerId: 'test',
  //  score: 0,
  //  ressources: this.tst_inventory,
  //  firstDice: 0,
  //  secondDice: 0
  //}

  //private loopData: GameLoopData = {
  //  firstDice: 0,
  //  secondDice: 0,
  //  roadsBuilt: 0,
  //  settlementsBuilt: 0
  //}

  game = new GameStateContext(new RessourcePhase());
  // --------------------------------

  rollDice(): { value: number | null, message: string | null } {
    let response: RollResponse = this.game.request1();
    return { value: response.value, message: response.message };
  }

  //resetDices( player: Player ) {
  //  player.firstDice = 0;
  //  player.secondDice = 0;
  //}

  //rollDice(): { value: number | null, message: string | null } {
  //  let value: number | null = Math.floor(Math.random() * 6) + 1;
  //  let message: string | null = null;

  //  if (this.tst_plyr.firstDice === 0) this.tst_plyr.firstDice = value;
  //  else if (this.tst_plyr.secondDice === 0) this.tst_plyr.secondDice = value;
  //  else {
  //    value = null;
  //    message = 'You already rolled both dices.';
  //  }
  //  return { value, message };
  //}

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
