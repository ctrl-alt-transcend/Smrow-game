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

//INFO: data we need to colect from the database when a client join a game
export type PlayerProfile = {
  id: string;
  username: string;
  //level: number;
  avatarURL: string | null;
}

export interface GameResponse {
  value: number | null;
  message: string | null;
  data: GameData | null;
}

export type PlayerBase = {
  playerId: string;
  username: string;
  victoryPoints: number;
  level: number;
  resources: Resources;
  firstDice: number,
  secondDice: number,
  totalDice: number,
  roadsBuilt: number;
  faction: Faction;
  avatarURL: string | null;
  personalLog: GameLog;
}

export type Player = PlayerBase & {
  settlementsBuilt: Map<string, SettlementData>
}

export type PlayerDto = PlayerBase

export type GameDataBase = {
  winner: string | null;
  winCondition: string | null;
  gameId: string;
  currentRoll: number | null;
  dicesSum: number;
  masterLog: string;
  board: GameBoard;
}

export type GameData = GameDataBase & {
  players: Map<string, Player>;
  startingRolls: Map<string, number | null>;
  turnCount: number;
  turnOrder: string[];
  currentTurnIndex: number;
}

export type GameDataDto  = GameDataBase & {
  players: Player[];
  currentPlayer: PlayerDto;
}


export type GameLog = {
  id: number,
  message: string,
  actionValid?: boolean
}

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

export type BuildRequestPayload =
  | { kind: 'road';       id: string; data: RoadData }
  | { kind: 'settlement'; id: string; data: SettlementData };
