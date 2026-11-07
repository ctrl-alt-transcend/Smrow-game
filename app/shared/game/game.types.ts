import { Faction,
  RessourceType,
  TraderType,
  type GameBoard,
  type RoadData,
  type SettlementData
} from "./gameboard.types";

export type Resources = {
  wood: number;
  brick: number;
  wheat: number;
  sheep: number;
  ore: number;
}

export type Player = {
  playerId: string;
  username: string;
  score: number;
  level: number;
  resources: Resources;
  firstDice: number,
  secondDice: number,
  totalDice: number,
  settlementsBuilt: Map<string, SettlementData>
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
  currentRoll: number | null;
  dicesSum: number;
  masterLog: string | null;
  board: GameBoard;
}

export interface GameResponse {
  value: number | null;
  message: string | null;
  data: GameData | null;
}

export type GameDataDto = { //INFO: data we send to the client every time the game state changes
  currentPlayer: Player;
  players: Player[];
  //turnCount: number;
  //turnOrder: string[];
  //currentTurnIndex: number;
  gameId: string;
  dicesSum: number | null;
  currentRoll: number | null;
  masterLog: string | null;
  board: GameBoard;
}

export type BuildRequestPayload =
  | { kind: 'road';       id: string; data: RoadData }
  | { kind: 'settlement'; id: string; data: SettlementData };

export type TradeForm = {
  resource: RessourceType;
  amount: number;
}

export type TradeRequestPayload = {
  trader: TraderType;
  sourceId: string;
  offer: TradeForm;
  target: TradeForm;
}

