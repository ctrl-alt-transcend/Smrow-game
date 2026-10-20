import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameState,
  Player,
  Ressources,
  GameLoopData
} from '../../shared/game/game.types';
import {
  GamePhaseContext,
  StartingPhase,
  RessourcePhase,
  TradeAndBuildPhase
} from './game.context';

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
      firstDice: 0,
      secondDice: 0
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

  private tst_plyr: Player = {
    playerId: 'test',
    score: 0,
    ressources: this.tst_inventory,
    firstDice: 0,
    secondDice: 0
  }

  private loopData: GameLoopData = {
    firstRoll: 0,
    secondRoll: 0,
    roadsBuilt: 0,
    settlementsBuilt: 0
  }

  phase = new GamePhaseContext(new StartingPhase());
  // --------------------------------

  rollDice(): { value: number } {
    const value = Math.floor(Math.random() * 6) + 1;

    if (this.loopData.firstRoll === 0) this.loopData.firstRoll = value;
    else if (this.loopData.secondRoll === 0) this.loopData.secondRoll = value;

    const count = this.loopData.firstRoll + this.loopData.secondRoll;

    return { value };
  }

  getLoopData(): GameLoopData {
    return { ...this.loopData };
  }

  rolledDice(): string {
    if(!this.loopData.firstRoll) {
      this.loopData.firstRoll = -1;
      return `First roll with a [${this.loopData.firstRoll}]`;
    }
    if(!this.loopData.secondRoll) {
      this.loopData.secondRoll = -6;
      return `Second roll with a [${this.loopData.secondRoll}]`;
    }
    return `You already rolled your dices, first [${this.loopData.firstRoll}], second [${this.loopData.secondRoll}]`;
  }

  buildRoad(): string {
    //if(this.phase.)
    if(this.loopData.firstRoll && this.loopData.firstRoll) {
      this.loopData.firstRoll = 0;
      this.loopData.secondRoll = 0;
    }
    this.loopData.roadsBuilt++;
    return `You built your #${this.loopData.roadsBuilt}th road !`;
  }

  buildSettlement(): string {
    //const game = new GamePhaseContext(new StartingPhase());
    //game.request1();
    //game.request2();
    //game.request2();
    this.phase.request1(this.tst_plyr);
    this.phase.request2();
    this.phase.request2();
    if(this.loopData.firstRoll && this.loopData.firstRoll) {
      this.loopData.firstRoll = 0;
      this.loopData.secondRoll = 0;
    }
    this.loopData.settlementsBuilt++;
    return `You built your #${this.loopData.settlementsBuilt}th settlement !`;
  }

}
