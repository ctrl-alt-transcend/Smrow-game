import { z } from 'zod'

/** Rules value */
export const SPECIAL_PORT_RATE = 2;
export const GENERIC_PORT_RATE = 3;
export const RESERVE_RATE = 4;
export const SETTLEMENT_POINT = 1;

export const TRADE_LIMIT_DFLT = 2;
export const BUILD_LIMIT_DFLT = 2;

export const CITY_POINT = 1;
export const POINTS_TO_WIN = 10;
export const ROBBER_ROLL = 7;
export const CROSSROADS_RULE = 3;

/** Rendering */
export const SELECTED_COLOR = "#c30000";
export const HOVER_COLOR = "#ff0f0f";
export const DEFAULT_COLOR = "#e4e4e4";

export const RENDER_SIZE = 50;
export const HEX_SIZE = RENDER_SIZE;
export const VERTEX_SIZE = RENDER_SIZE / 6;
export const SETTLEMENT_SIZE = RENDER_SIZE / 4;
export const ICON_SCALE_BASE = 9;
export const ROAD_SIZE = RENDER_SIZE / 8;
export const HOVER_EFFECT = 1.2;

export const SAND_WIDTH = 25;
export const SAND_COLOR = "#e8c998";

export const WATER_WIDTH = 48;
export const WATER_COLOR = "#4a9ecf";
export const WATER_OPACITY = 1;

export const SPECIALIZED_PORT_COLOR = "#ffffff";
export const NORMAL_PORT_COLOR = "#000000";

export const BuildingType = {
  ROAD: "road",
  SETTLEMENT: "settlement",
  CITY: "city",
} as const;
export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType];

export const TraderType = {
  SPECIALIZED_PORT: 'specialized port',
  GENERIC_PORT: "generic port",
  RESERVE: 'reserve',
  PLAYER: "player",
} as const;
export type TraderType = (typeof TraderType)[keyof typeof TraderType];
export const TraderTypeSchema = z.enum(TraderType);

export const BUILD_COSTS: Record<BuildingType, Resources> = {
  [BuildingType.ROAD]: {
    wood: 1,
    brick: 1,
    wheat: 0,
    sheep: 0,
    ore: 0
  },
  [BuildingType.SETTLEMENT]: {
    wood: 1,
    brick: 1,
    wheat: 1,
    sheep: 1,
    ore: 0
  },
  [BuildingType.CITY]: {
    wood: 0,
    brick: 0,
    wheat: 2,
    sheep: 0,
    ore: 3
  },
};

export const LandType = {
  FOREST: "forest",
  PASTURE: "pasture",
  HILL: "hill",
  MOUNTAIN: "mountain",
  FIELD: "field",
  DESERT: "desert"
} as const;
export type LandType = (typeof LandType)[keyof typeof LandType];

export const ResourceType = {
  WOOD: 'wood',
  SHEEP: 'sheep',
  BRICK: 'brick',
  ORE: 'ore',
  WHEAT: 'wheat',
  DUST: "dust",
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
export const ResourceTypeSchema = z.enum(ResourceType);

export const LAND_RESSOURCE: Record<LandType, string> = {
  [LandType.FOREST]: ResourceType.WOOD,
  [LandType.PASTURE]: ResourceType.SHEEP,
  [LandType.HILL]: ResourceType.BRICK,
  [LandType.MOUNTAIN]: ResourceType.ORE,
  [LandType.FIELD]: ResourceType.WHEAT,
  [LandType.DESERT]: ResourceType.DUST
};

export const LAND_COLORS: Record<LandType, string> = {
  [LandType.FOREST]: '#4a7c2e',
  [LandType.PASTURE]: '#96d682',
  [LandType.HILL]: '#c49b5a',
  [LandType.MOUNTAIN]: '#8a8a8a',
  [LandType.FIELD]: '#f5e68a',
  [LandType.DESERT]: '#e8cfa0'
};

//export const Faction = {
//  POURPRES_CHYBRES: "Pourpres Chybres",
//  BOURSES_BLEUES: "Bourses Bleues",
//  ROSES_FIACS: "Roses Fiacs",
//  UREE_JAUNE: "Uree Jaune",
//  DEFAULT: "Kikouneurs (default)",
//  UNOCCUPIED: "unoccupied ...",
//} as const;
//export type Faction = (typeof Faction)[keyof typeof Faction];
export const Faction = {
  POURPRES_CHYBRES: "Pourpres Chybres",
  BOURSES_BLEUES: "Bourses Bleues",
  ROSES_FIACS: "Roses Fiacs",
  UREE_JAUNE: "Uree Jaune",
  DEFAULT: "Kikouneurs (default)",
  UNOCCUPIED: "unoccupied ...",
} as const;
export type Faction = (typeof Faction)[keyof typeof Faction];
export const FactionSchema = z.enum(Faction);

export const FACTION_COLORS: Record<Faction, string> = {
  [Faction.POURPRES_CHYBRES]: '#cf69f8',
  [Faction.BOURSES_BLEUES]: '#58b6d3',
  [Faction.ROSES_FIACS]: '#f0a1a1',
  [Faction.UREE_JAUNE]: '#f6e823',
  [Faction.DEFAULT]: '#19af89',
  [Faction.UNOCCUPIED]: '#e4e4e4'
};

export const Action = {
  DICE: 'roll the dices',
  BUILD: 'build',
  TRADE: 'trade',
  SKIP: 'skip the turn',
  BUILD_LIMIT: 'build more for this turn',
  TRADE_LIMIT: 'trade more for this turn',
} as const;
export type Action = (typeof Action)[keyof typeof Action];

export const Phase = {
  START: 'start phase',
  PLACEMENT: 'placement phase',
  RESOURCES: 'resources phase',
  TRADE_BUILD: 'trade and build phase'
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const GUIDE_LOG: Record<Phase, string> = {
  [Phase.START]: `${Phase.START}: ${Action.DICE}`,
  [Phase.PLACEMENT]: `${Phase.PLACEMENT}: build a settllement and a road`,
  [Phase.RESOURCES]: `${Phase.RESOURCES}: ${Action.DICE} to collect you resources`,
  [Phase.TRADE_BUILD]: `${Phase.TRADE_BUILD}: build, trade, upgrade or skip you turn!`,
} as const;

//export interface Vertex {
//  id: string; // "{q}:{r}:{cornerIndex}"
//  x: number;
//  y: number;
//}
/** @description x, y → corner's axial coordinates */
export const VertexSchema = z.object({
  id: z.string(), // "{q}:{r}:{cornerIndex}"
  x: z.number(),
  y: z.number(),
});
export type Vertex = z.infer<typeof VertexSchema>;

//export interface Edge {
//  id: string; // "{vertexId1}-{vertexId2}"
//  p1: Vertex;
//  p2: Vertex;
//}
/** @description p1, p2 → segment between two vertices (corner to corner) */
export const EdgeSchema = z.object({
  id: z.string(), // "{vertexId1}-{vertexId2}"
  p1: VertexSchema,
  p2: VertexSchema,
});
export type Edge = z.infer<typeof EdgeSchema>;

export interface SvgBounds {
  svgWidth: number;
  svgHeight: number;
  offsetX: number;
  offsetY: number;
}

/** @description q = column, r = row → center coordinates of a tile */
export interface TileData {
  q: number;
  r: number;
  value: number;
  land: LandType;
  hasRobber: boolean;
}

//export interface BuildData {
//  faction: Faction;
//  ownerId: string | null;
//}
export const BuildDataSchema = z.object({
  faction: FactionSchema,
  ownerId: z.string().nullable(), // string | null
});
export type BuildData = z.infer<typeof BuildDataSchema>;

//export interface RoadData extends BuildData {
//  id: string;
//  edge: Edge;
//}
export const RoadDataSchema = BuildDataSchema.extend({
  id: z.string(),
  edge: EdgeSchema,
});
export type RoadData = z.infer<typeof RoadDataSchema>;

//export interface SettlementData extends BuildData {
//  id: string;
//  vertex: Vertex;
//  isCity: boolean;
//  isCrossroad?: boolean;
//}
export const SettlementDataSchema = BuildDataSchema.extend({
  id: z.string(),
  vertex: VertexSchema,
  isCity: z.boolean(),
  isCrossroad: z.boolean().optional(),
});
export type SettlementData = z.infer<typeof SettlementDataSchema>;

export interface CoastData {
  id: string;              // "coast:<edgeId>"
  tile: { q: number; r: number };  // tile land that bears the coast
  edge: Edge;              // the outer edge p1→p2
  normal: Vertex;          // unit vector pointing toward the sea
  port: PortData | null;
}

export type PortType = ResourceType | 'generic';

export interface PortData {
  id: string;
  type: PortType;
  coastId: string;
}

export interface ReserveData {
  id: string;
  position: Vertex;
}

/** @description sent to the front, serializable without risk */
export interface GameBoard {
  layout: TileData[];
  vertices: Vertex[];
  edges: Edge[];
  settlements: SettlementData[];
  roads: RoadData[];
  coasts: CoastData[];
  reserve: ReserveData;
  svgBounds: SvgBounds;
}

export type CoreElement =
{ type: 'road'; data: RoadData} |
{ type: 'settlement'; data: SettlementData} |
{ type: 'port'; data: PortData} |
{ type: 'none'; data: null};

/** @description keeps relations between each gameboard's elements*/
export interface ConnectedElements {
  core: CoreElement;
  /** @description keeps for one road every "neighbours" roads (up to 4 neighbours)*/
  connectedRoads: RoadData[];
  /** @description keeps for one road every settlement it is touching (up to 2 settlements)*/
  connectedSettlements: SettlementData[];
  /** @description keeps for one settlement every "neighbours" settlement (up to 3 neighbours)*/
  neighboursSettlements: SettlementData[];
  /** @description keeps for one settlement every hex tiles it is touching (up to 3 hex tiles -> lands)*/
  adjacentTiles: TileData[];
}
/** @description retained on the back-end only, never sent to front */
export type GameBoardGraph = Map<string, ConnectedElements>;

/**
 * @key settlement id
 * @value player who built
*/
export type BuildingsInGame = Map<string, Player>;

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2, land: LandType.FOREST, value: 2, hasRobber: false }, { q: 1, r: -2, land: LandType.PASTURE, value: 9, hasRobber: false }, { q: 2, r: -2, land: LandType.MOUNTAIN, value: 8, hasRobber: false },
    { q: -1, r: -1, land: LandType.PASTURE, value: 11, hasRobber: false }, { q: 0, r: -1, land: LandType.HILL, value: 6, hasRobber: false }, { q: 1, r: -1, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 2, r: -1, land: LandType.MOUNTAIN, value: 4, hasRobber: false },
    { q: -2, r: 0, land: LandType.FIELD, value: 12, hasRobber: false }, { q: -1, r: 0, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10, hasRobber: false }, { q: 1, r: 0, land: LandType.FOREST, value: 3, hasRobber: false }, { q: 2, r: 0, land: LandType.PASTURE, value: 9, hasRobber: false },
    { q: -2, r: 1, land: LandType.PASTURE, value:6, hasRobber: false },{ q: -1, r: 1, land: LandType.FOREST, value: 4, hasRobber: false }, { q: 0, r: 1, land: LandType.FOREST, value: 11, hasRobber: false }, { q: 1, r: 1, land: LandType.HILL, value: 8, hasRobber: false },
    { q: -2, r: 2, land: LandType.HILL, value: 8, hasRobber: false },{ q: -1, r: 2, land: LandType.DESERT, value: 10, hasRobber: true }, { q: 0, r: 2, land: LandType.FIELD, value: 12, hasRobber: false }
];

// ----------------

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
};

export type PlayerBase = {
  playerId: string;
  username: string;
  level: number;
  stats: StatsData;
  victoryPoints: number;
  resources: Resources;
  firstDice: number,
  secondDice: number,
  currentRoll: number | null,
  roadsBuilt: number;
  faction: Faction;
  avatarURL: string | null;
  personalLog: GameLog;
  guideLog: string;
  DEVMOD: boolean;
}

export type Player = PlayerBase & {
  settlementsBuilt: Map<string, SettlementData>
}

export type PlayerDto = PlayerBase

export type GameDataBase = {
  winner: string | null;
  winCondition: string | null;
  gameId: string;
  dicesSum: number;
  masterLog: string;
  board: GameBoard;
  whosTurn: string;
  currentPhase: Phase;
}

export type GameDataDto  = GameDataBase & {
  players: Player[];
  currentPlayer: PlayerDto;
}

export type GameData = GameDataBase & {
  players: Map<string, Player>;
  startingRolls: Map<string, number>;
  turnOrder: string[];
  currentTurnIndex: number;
}

export interface GameResponse {
  value: number | null;
  message: string | null;
  data: GameData | null;
}

//export type SettingsData = {
//  tradeLimit: number;
//  buildLimit: number;
//}
/**
 * @var tradeLimit: defines how many valid trades a player can do during 'Trade and Build'
 * @var buildLimit: defines how many valid build a player can do during 'Trade and Build'
*/
export const SettingsDataSchema = z.object({
  tradeLimit: z.number().int().nonnegative(),
  buildLimit: z.number().int().nonnegative(),
});
export type SettingsData = z.infer<typeof SettingsDataSchema>;

export type StatsData = {
  // Build
  roadsBuilt: number;
  //settlementsBuilt: number;
  //citiesBuilt: number;

  // Resources
  //resourcesGained: number;
  //resourcesSpent: number;
  //tradesMade: number;
  //tradeRequestsRefused: number;

  // Dices
  //diceRolls: number;
  //sevenRolledCount: number;

  // Gameboard events
  //robberSteals: number;
  //crossroadsAchieved: number;

  // Progression
  //victoryPoints: number;
  //gamesPlayed: number;
  //gamesWon: number;
  //turnsPlayed: number;

  //...
};

export type GameLog = {
  id: number,
  message: string,
  actionValid?: boolean
}

export const TradeFormSchema = z.object({
  resource: ResourceTypeSchema,
  amount: z.number().nonnegative(),
})
export type TradeForm = z.infer<typeof TradeFormSchema>;

export const TradePayloadSchema = z.object({
  trader: TraderTypeSchema,
  sourceId: z.string().nonempty(),
  offer: TradeFormSchema,
  target: TradeFormSchema,
})
export type TradePayload = z.infer<typeof TradePayloadSchema>;

//export type BuildPayload =
//  | { kind: 'road';       id: string; data: RoadData }
//  | { kind: 'settlement'; id: string; data: SettlementData };
export const BuildPayloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal('road'),
    id: z.string(),
    data: RoadDataSchema,
  }),
  z.object({
    kind: z.literal('settlement'),
    id: z.string(),
    data: SettlementDataSchema,
  }),
]);
export type BuildPayload = z.infer<typeof BuildPayloadSchema>;
