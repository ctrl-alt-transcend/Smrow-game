export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
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

export type GameState = {
  gameId: string;
  players: Player[];
  playerTurn: string;
}

// test copy of GameState to implement in GameStateContext
export type GameData = {
  players: Map<string, Player>;
  startingRolls: Map<string, number | null>;
  turnCount: number;
  turnOrder: string[];
  currentTurnIndex: number;
  gameId: string;
}

export interface GameResponse {
  value: number | null;
  message: string | null;
}
