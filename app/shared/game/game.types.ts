//import { DiceValue } from "../../frontend/src/game/components/gameboard/Dice/Dice";

export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
}

export type GameLoopData = {
  firstDice: number;
  secondDice: number;
  roadsBuilt: number;
  settlementsBuilt: number;
}


export type Player = {
  playerId: string;
  score: number;
  ressources: Ressources | null;
  firstDice: number,
  secondDice: number,
  settlementsBuilt: number;
  roadsBuilt: number;
  //color: ""
}

//export const GamePhase = {
//  INIT: 'init phase',
//  START: 'starting phase',
//  RESSOURCE: 'ressource phase',
//  TRADE_BUILD: 'trade and build phase',
//  END: 'end phase'
//} as const

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}

// test copy of GameState to implement in GameStateContext
export type GameData = {
  //playerTurn: string;
  currentPlayer: number;
  gameId: string;
  player: Player[];
}

export interface RollResponse {
  value: number | null;
  message: string | null;
}
