import { Faction,
  type GameBoard,
  type RoadData,
  type SettlementData
} from "./gameboard.types";

export type Ressources = {
  wood: number;
  brick: number;
  hay: number;
  sheep: number;
  rock: number;
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
  faction: Faction;
  avatarURL: string | null;
}

//INFO: data we need to colect from the database when a client join a game
export type PlayerProfile = {
  id: string;
  username: string;
  //level: number;
  avatarURL: string | null;
}

export type GameData = {
  players: Map<string, Player>;
  startingRolls: Map<string, number | null>;
  turnCount: number;
  turnOrder: string[];
  currentTurnIndex: number;
  gameId: string;
  diceRoll: number | null;
  masterLog: string | null;
  board: GameBoard;
}

export interface GameResponse {
  value: number | null;
  message: string | null;
  board: GameData | null;
}

export type GameDataDto = { //INFO: data we send to the client every time the game state changes
  players: Player[];
  //turnCount: number;
  //turnOrder: string[];
  //currentTurnIndex: number;
  gameId: string;
  diceRoll: number | null;
  masterLog: string | null;
  board: GameBoard;
}

export type BuildRequestPayload =
  | { kind: 'road';       id: string; data: RoadData }
  | { kind: 'settlement'; id: string; data: SettlementData };

