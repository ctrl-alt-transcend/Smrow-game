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
  username: string;
  score: number;
  level: number;
  ressources: Ressources | null;
  firstDice: number,
  secondDice: number,
  settlementsBuilt: number;
  roadsBuilt: number;
  //color: ""
  avatarURL: string | null;
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
  diceRoll: number | null;
  masterLog: string | null;
}

//INFO: data we need to colect from the database when a client join a game
export type PlayerProfile = {
  id: string;
  username: string;
  //level: number;
  avatarURL: string | null;
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
