import { z } from 'zod'

/***********************************
 * Rules value
 **********************************/
export const ROAD = 'Road';
export const SETTLEMENT = 'Settlement';
export const CITY = 'City';
export const PORT = 'Port';
export const COAST = 'Coast';
export const TILE = 'Tile';
export const RESERVE = 'Reserve';
export const NONE = 'none';
export const RESERVE_NAME = 'Shnek the Trader';
export const ROBBER_NAME = 'Robert the Robber';

export const GameboardLayout = {
  CLASSIC_LAYOUT: 'Catan Island',
  SMROW_LAYOUT: 'Smrow Island',
  GORP_LAYOUT: 'Gorp Island',
} as const;
export type GameboardLayout = (typeof GameboardLayout)[keyof typeof GameboardLayout];
export const GameboardLayoutSchema = z.enum(GameboardLayout);

export const TRADE_LIMIT_DFLT = 15;
export const BUILD_LIMIT_DFLT = 15;

export const SPECIAL_PORT_OFFER_RATE_DFLT = 2;
export const GENERIC_PORT_OFFER_RATE_DFLT = 3;
export const RESERVE_OFFER_RATE_DFLT = 4;

export const ROAD_POINT_DFLT = 0;
export const SETTLEMENT_POINT_DFLT = 1;
export const CITY_POINT_DFLT = 1;
export const POINTS_TO_WIN_DFLT = 10;

export const ROBBER_THRESHOLD_DFLT = 7;
export const ROBBER_THRESHOLD_MAX = 150;

export const MIN_SETTINGS = 1;
export const MAX_LIMIT = 40;
export const MAX_RATE = 6;
export const MAX_POINTS = 10;
export const MAX_POINTS_TO_WIN = 100;
export const MAX_BONUS = 30;
export const MAX_MULTIPLIER = 5;
export const MIN_MULTIPLIER = 1;
export const MULTIPLIER_DFLT = 2;
export const TIME_MAX = 180;
export const TIME_MIN = 5;
export const TIME_DFLT = 90;

export const SettingsDataSchema = z.object({
  // Layout setting
  gameboardLayout: GameboardLayoutSchema,

  // Limits settings
  /** Time countdown before autoplay */
  turnDurationSeconds: z.number().int().nonnegative().min(TIME_MIN).max(TIME_MAX),
  /** Number of trades authorized during 'Trade and Buil' phase */
  tradeLimit: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_LIMIT),
  /** Number of builds authorized during 'Trade and Buil' phase */
  buildLimit: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_LIMIT),

  // Trades settings
  /** 'Specialized Port' trade offer ratio */
  specialPortOfferRate: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_RATE),
  /** 'Generic Port' trade offer ratio */
  genericPortOfferRate: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_RATE),
  /** 'Reserve' trade offer ratio */
  reserveOfferRate: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_RATE),

  // Victory Points settings
  /** Amount of points earned by building a settlement */
  settlementPoints: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_POINTS),
  /** Amount of points earned by building a city */
  cityPoints: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_POINTS),
  /** Amount of points earned by building a road */
  roadPoints: z.number().int().nonnegative().min(0).max(MAX_POINTS),
  /** Amount of points to win the game */
  pointsToWin: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_POINTS_TO_WIN),

  // Magic Dice settings
  /** Enables Magic Dice roll at each new round */
  magicDiceEnabled: z.number().min(0).max(1),
  /** Time countdown before Magic Dice vanishes */
  magicDiceDurationSeconds: z.number().int().nonnegative().min(MIN_SETTINGS).max(MAX_LIMIT),

  // Bonus settings
  /** Threshold resources amount for the players to be stolen by the robber */
  robberThreshold: z.number().int().nonnegative().min(MIN_SETTINGS).max(ROBBER_THRESHOLD_MAX),
  /** Resource multiplication at production */
  resourcesMultiplier: z.number().int().nonnegative().min(MIN_MULTIPLIER).max(MAX_MULTIPLIER),
  /** Amount of wood to start the game with*/
  woodBonus: z.number().int().nonnegative().min(0).max(MAX_BONUS),
  /** Amount of sheep to start the game with*/
  sheepBonus: z.number().int().nonnegative().min(0).max(MAX_BONUS),
  /** Amount of brick to start the game with*/
  brickBonus: z.number().int().nonnegative().min(0).max(MAX_BONUS),
  /** Amount of ore to start the game with*/
  oreBonus: z.number().int().nonnegative().min(0).max(MAX_BONUS),
  /** Amount of wheat to start the game with*/
  wheatBonus: z.number().int().nonnegative().min(0).max(MAX_BONUS),
});
export type SettingsData = z.infer<typeof SettingsDataSchema>;

export const CROSSROAD_RULE = 3;
export const ROBBER_ROLL = 7;

export const BuildingType = {
  ROAD: ROAD,
  SETTLEMENT: SETTLEMENT,
  CITY: CITY,
} as const;
export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType];
export const BuildingTypeSchema = z.enum(BuildingType);

export const TraderType = {
  SPECIALIZED_PORT: 'Specialized Port',
  GENERIC_PORT: 'Generic Port',
  RESERVE: 'Reserve',
  PLAYER: 'Player',
} as const;
export type TraderType = (typeof TraderType)[keyof typeof TraderType];
export const TraderTypeSchema = z.enum(TraderType);

export const LandType = {
  FOREST: "Forest",
  PASTURE: "Pasture",
  HILL: "Hill",
  MOUNTAIN: "Mountain",
  FIELD: "Field",
  DESERT: "Desert"
} as const;
export type LandType = (typeof LandType)[keyof typeof LandType];

export const ResourceType = {
  WOOD: 'Wood',
  SHEEP: 'Sheep',
  BRICK: 'Brick',
  ORE: 'Ore',
  WHEAT: 'Wheat',
  NOTHING: 'nothing',
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
export const ResourceTypeSchema = z.enum(ResourceType);

export const LAND_RESOURCE: Record<LandType, string> = {
  [LandType.FOREST]: ResourceType.WOOD,
  [LandType.PASTURE]: ResourceType.SHEEP,
  [LandType.HILL]: ResourceType.BRICK,
  [LandType.MOUNTAIN]: ResourceType.ORE,
  [LandType.FIELD]: ResourceType.WHEAT,
  [LandType.DESERT]: ResourceType.NOTHING
};

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

/***********************************
 * Actions and Logs
 **********************************/
export const NotifColor = {
  GREEN: 'green',
  RED: 'red',
  PURPLE: 'grape'
} as const;
export type NotifColor = (typeof NotifColor)[keyof typeof NotifColor];

export const PERSONNAL_LOG_LIMIT = 3;
export const ROLLED_A = 'rolled a';
export const YOU_DIDNT_ROLLED = "You couldn't roll the dice";

export const Action = {
  DICE: 'roll the dices',
  BUILD: 'build',
  TRADE: 'trade',
  SKIP: 'end the turn',
  BUILD_LIMIT: 'build more for this turn',
  TRADE_LIMIT: 'trade more for this turn',
} as const;
export type Action = (typeof Action)[keyof typeof Action];

export const Phase = {
  PENDING: 'Pending Player',
  START: 'Start Phase',
  PLACEMENT: 'Placement Phase',
  RESOURCES: 'Resources Phase',
  TRADE_BUILD: 'Trade & Build Phase',
  MAGIC_DICE: 'Magic Dice Phase'
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const GUIDE_LOG: Record<Phase, string> = {
  [Phase.PENDING]: "Waiting for other players ...",
  [Phase.START]: `${Phase.START}: ${Action.DICE}`,
  [Phase.PLACEMENT]: `${Phase.PLACEMENT}: build a settllement and a road.`,
  [Phase.RESOURCES]: `${Phase.RESOURCES}: ${Action.DICE} to collect your resources.`,
  [Phase.TRADE_BUILD]: `${Phase.TRADE_BUILD}: build, trade, upgrade! End your turn when you're done.`,
  [Phase.MAGIC_DICE]: `${Phase.MAGIC_DICE}: choose wisely, roll it at your own risk!`,
} as const;

export const START_PHASE_INFO =
"Every player rolls the dice. The starting order is decided by the " +
"dice result, ranked from the highest to the lowest roll."

export const PLACEMENT_PHASE_INFO =
"Each player places one settlement and one adjacent road to set up " +
"their first positions. They then collect their starting resources " +
"from the three tiles touching their settlement."

export const RESOURCE_PHASE_INFO =
"On their turn, a player rolls the dice. If the total matches a " +
"tile touching one of their settlements, they collect the " +
"corresponding resources. Rolling a 7 triggers the robber rule " +
"instead of any production."

export const TRADE_BUILD_INFO =
"During this phase the player gets a limited amount of trade and build " +
"actions to trade with the reserve (unlimited stock, no bankruptcy), " +
"generic or specialized ports, and to build roads, place new settlements, " +
"or upgrade existing settlements into cities to earn victory points.\n"

export const END_GAME_PHASE = "End of the game";
export const END_GAME_INFO =
`After the « ${Phase.PLACEMENT} », the game alternates between the ` +
`« ${Phase.RESOURCES} » and « ${Phase.TRADE_BUILD} » until a player ` +
"reaches the amount of victory points to win."

export const SPECIAL_RULES = "Special Rules";
export const SPECIAL_RULES_INFO =
"• Robber Rule: when a 7 is rolled, every player loses half of their " +
"total resources if that total is greater than 7. The robber then " +
"moves randomly to another tile, blocking the resources the tiles " +
"would normally produce\n" +
"• Crossroad Rule: build the 3 roads surrounding one of your " +
"settlements to earn a victory point.\n"

export const CURRENT_GAME_SETTINGS = "Current Game Settings"

/***********************************
 * Gameboard Elements
 **********************************/
/** @description x, y → corner's axial coordinates */
export const VertexSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
});
export type Vertex = z.infer<typeof VertexSchema>;

/** @description p1, p2 → segment between two vertices (corner to corner) */
export const EdgeSchema = z.object({
  id: z.string(),
  p1: VertexSchema,
  p2: VertexSchema,
});
export type Edge = z.infer<typeof EdgeSchema>;

/***********************************
 * Rendering
 **********************************/
export const SELECTED_COLOR = "#c30000";
export const HOVER_COLOR = "#ff0f0f";
export const DEFAULT_COLOR = "#e4e4e4";

export const RENDER_SIZE = 50;
export const HEX_SIZE = RENDER_SIZE;
export const VERTEX_SIZE = RENDER_SIZE / 6;
export const SETTLEMENT_SIZE = RENDER_SIZE / 4;
export const ROAD_SIZE = RENDER_SIZE / 8;
export const HOVER_EFFECT = 1.2;
export const ICON_SCALE_BASE = 9;

export const SAND_WIDTH = 25;
export const SAND_COLOR = "#e8c998";

export const WATER_WIDTH = 48;
export const WATER_COLOR = "#4a9ecf";
export const WATER_OPACITY = 1;

export const SPECIALIZED_PORT_COLOR = "#ffffff";
export const NORMAL_PORT_COLOR = "#000000";

export const LAND_COLORS: Record<LandType, string> = {
  [LandType.FOREST]: '#4a7c2e',
  [LandType.PASTURE]: '#96d682',
  [LandType.HILL]: '#c49b5a',
  [LandType.MOUNTAIN]: '#8a8a8a',
  [LandType.FIELD]: '#f5e68a',
  [LandType.DESERT]: '#e8cfa0'
};

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

/***********************************
 * Gameboard
 **********************************/
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

export const BuildDataSchema = z.object({
  faction: FactionSchema,
  ownerId: z.string().nullable(), // string | null
});
export type BuildData = z.infer<typeof BuildDataSchema>;

export const RoadDataSchema = BuildDataSchema.extend({
  id: z.string(),
  edge: EdgeSchema,
});
export type RoadData = z.infer<typeof RoadDataSchema>;

export const SettlementDataSchema = BuildDataSchema.extend({
  id: z.string(),
  vertex: VertexSchema,
  isCity: z.boolean(),
  isCrossroad: z.boolean().optional(),
});
export type SettlementData = z.infer<typeof SettlementDataSchema>;

export interface CoastData {
  id: string;                       // "coast:<edgeId>"
  tile: { q: number; r: number };   // tile land that bears the coast
  edge: Edge;                       // the outer edge p1→p2
  normal: Vertex;                   // unit vector pointing toward the sea
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

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2, land: LandType.FOREST, value: 2, hasRobber: false }, { q: 1, r: -2, land: LandType.PASTURE, value: 9, hasRobber: false }, { q: 2, r: -2, land: LandType.MOUNTAIN, value: 8, hasRobber: false },
    { q: -1, r: -1, land: LandType.PASTURE, value: 11, hasRobber: false }, { q: 0, r: -1, land: LandType.HILL, value: 6, hasRobber: false }, { q: 1, r: -1, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 2, r: -1, land: LandType.MOUNTAIN, value: 4, hasRobber: false },
    { q: -2, r: 0, land: LandType.FIELD, value: 12, hasRobber: false }, { q: -1, r: 0, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10, hasRobber: false }, { q: 1, r: 0, land: LandType.FOREST, value: 3, hasRobber: false }, { q: 2, r: 0, land: LandType.PASTURE, value: 9, hasRobber: false },
    { q: -2, r: 1, land: LandType.PASTURE, value:6, hasRobber: false },{ q: -1, r: 1, land: LandType.FOREST, value: 4, hasRobber: false }, { q: 0, r: 1, land: LandType.FOREST, value: 11, hasRobber: false }, { q: 1, r: 1, land: LandType.HILL, value: 8, hasRobber: false },
    { q: -2, r: 2, land: LandType.HILL, value: 8, hasRobber: false },{ q: -1, r: 2, land: LandType.DESERT, value: 10, hasRobber: true }, { q: 0, r: 2, land: LandType.FIELD, value: 12, hasRobber: false }
];

/** @description custom Layout #1 (19 tiles) */
export const smrowIsland: TileData[] = [
    { q: 1, r: -3, land: LandType.HILL, value: 8, hasRobber: false },{ q: 2, r: -3, land: LandType.DESERT, value: 10, hasRobber: true },
    { q: 1, r: -2, land: LandType.MOUNTAIN, value: 2, hasRobber: false }, { q: 2, r: -2, land: LandType.PASTURE, value: 9, hasRobber: false }, { q: 3, r: -2, land: LandType.FOREST, value: 8, hasRobber: false },
    { q: -1, r: -1, land: LandType.FOREST, value: 11, hasRobber: false }, { q: 0, r: -1, land: LandType.HILL, value: 6, hasRobber: false }, { q: 1, r: -1, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 2, r: -1, land: LandType.MOUNTAIN, value: 4, hasRobber: false },
    { q: -2, r: 0, land: LandType.HILL, value: 12, hasRobber: false }, { q: -1, r: 0, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10, hasRobber: false }, { q: 1, r: 0, land: LandType.FOREST, value: 3, hasRobber: false },
    { q: -2, r: 1, land: LandType.PASTURE, value:6, hasRobber: false },{ q: -1, r: 1, land: LandType.FOREST, value: 4, hasRobber: false }, { q: 0, r: 1, land: LandType.PASTURE, value: 11, hasRobber: false }, { q: 1, r: 1, land: LandType.FIELD, value: 8, hasRobber: false },
    { q: -1, r: 2, land: LandType.FIELD, value: 12, hasRobber: false }, { q: 0, r: 2, land: LandType.PASTURE, value: 9, hasRobber: false },
];

/** @description custom Layout #2 (19 tiles) */
export const gorpIsland: TileData[] = [
  { q: 1, r: -2, land: LandType.HILL, value: 6, hasRobber: false }, { q: 3, r: -2, land: LandType.FIELD, value: 5, hasRobber: false }, { q: 4, r: -2, land: LandType.MOUNTAIN, value: 4, hasRobber: false },
  { q: 1, r: -1, land: LandType.MOUNTAIN, value: 2, hasRobber: false }, { q: 2, r: -1, land: LandType.PASTURE, value: 9, hasRobber: false }, { q: 3, r: -1, land: LandType.FOREST, value: 8, hasRobber: false },
  { q: -2, r: 1, land: LandType.HILL, value: 12, hasRobber: false }, { q: -1, r: 1, land: LandType.DESERT, value: 5, hasRobber: true }, { q: 0, r: 1, land: LandType.MOUNTAIN, value: 10, hasRobber: false }, { q: 1, r: 1, land: LandType.FOREST, value: 3, hasRobber: false },
  { q: -1, r: 0, land: LandType.FOREST, value: 4, hasRobber: false }, { q: 0, r: 0, land: LandType.PASTURE, value: 11, hasRobber: false }, { q: 1, r: 0, land: LandType.FIELD, value: 8, hasRobber: false },
  { q: -1, r: 2, land: LandType.FIELD, value: 12, hasRobber: false }, { q: 0, r: 2, land: LandType.PASTURE, value: 9, hasRobber: false },
  { q: -1, r: 3, land: LandType.HILL, value: 8, hasRobber: false },{ q: 0, r: 3, land: LandType.FIELD, value: 10, hasRobber: false },
  { q: 0, r: 4, land: LandType.FOREST, value: 11, hasRobber: false }, { q: -1, r: 4, land: LandType.PASTURE, value:6, hasRobber: false },
];

/***********************************
 * Graph
 **********************************/
export type CoreElement =
{ type: typeof BuildingType.ROAD; data: RoadData} |
{ type: typeof BuildingType.SETTLEMENT; data: SettlementData} |
{ type: typeof PORT; data: PortData} |
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

/***********************************
 * Game Data
 **********************************/
export type GameDataBase = {
  winner: string | null;
  winCondition: string | null;
  gameId: string;
  dicesSum: number;
  masterLog: string;
  board: GameBoard;
  whosTurn: string;
  currentPhase: Phase;
  gameTerminated: boolean;
  currentRoll: DiceRoll;
}

export type GameDataDto  = GameDataBase & {
  players: PlayerPublicDto[];
  currentPlayer: PlayerDto;
  settings: SettingsData;
  magicDice: MagicDiceDto | null;
}

export type GameData = GameDataBase & {
  players: Map<string, Player>;
  startingRolls: Map<string, number>;
  turnOrder: string[];
  turnIndex: number;
}

/***********************************
 * Player Data
 **********************************/
//INFO: data we need to colect from the database when a client join a game
export type PlayerProfile = {
  id: string;
  username: string;
  //level: number;
  avatarURL: string | null;
};

export type Resources = {
  wood: number;
  brick: number;
  wheat: number;
  sheep: number;
  ore: number;
}

export type DiceRoll = {
  val: number | null;
  id: number;
}

export type GameLog = {
  id: number,
  message: string,
  color: NotifColor
}

export type PlayerBase = {
  id: string;
  username: string;
  level: number;
  victoryPoints: number;
  timeToPlay: number;
  firstDice: number,
  secondDice: number,
  currentRoll: DiceRoll,
  faction: Faction;
  avatarURL: string | null;
}

type PlayerPrivate = {
  guideLog: string;
  resources: Resources;
  personalLog: GameLog[];
}

export type Player = PlayerBase & PlayerPrivate & {
  settlementsBuilt: Map<string, SettlementData>
  firstSettlementPlaced: boolean;
}

export type PlayerPublicDto = PlayerBase;
export type PlayerDto = PlayerBase & PlayerPrivate;

/***********************************
 * Game Payloads
 **********************************/
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

export const BuildPayloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal(BuildingType.ROAD),
    id: z.string(),
    data: RoadDataSchema,
  }),
  z.object({
    kind: z.literal(BuildingType.SETTLEMENT),
    id: z.string(),
    data: SettlementDataSchema,
  }),
]);
export type BuildPayload = z.infer<typeof BuildPayloadSchema>;

/***********************************
 * Game Presets
 **********************************/
export const DEFAULT_PRESET: SettingsData = {
  gameboardLayout: GameboardLayout.CLASSIC_LAYOUT,
  turnDurationSeconds: 45,
  tradeLimit: 10,
  buildLimit: 10,
  specialPortOfferRate: 1,
  genericPortOfferRate: GENERIC_PORT_OFFER_RATE_DFLT,
  reserveOfferRate: RESERVE_OFFER_RATE_DFLT,
  settlementPoints: SETTLEMENT_POINT_DFLT,
  cityPoints: 2,
  pointsToWin: 15,
  roadPoints: 1,
  magicDiceEnabled: 1,
  magicDiceDurationSeconds: 15,
  robberThreshold: 50,
  resourcesMultiplier: MULTIPLIER_DFLT,
  woodBonus: 10,
  sheepBonus: 10,
  brickBonus: 10,
  oreBonus: 10,
  wheatBonus: 10,
};

export const MAXXING_PRESET: SettingsData = {
  gameboardLayout: GameboardLayout.CLASSIC_LAYOUT,
  turnDurationSeconds: 30,
  tradeLimit: MAX_LIMIT,
  buildLimit: MAX_LIMIT,
  specialPortOfferRate: 1,
  genericPortOfferRate: 2,
  reserveOfferRate: 3,
  roadPoints: 2,
  settlementPoints: 10,
  cityPoints: 8,
  pointsToWin: 70,
  magicDiceEnabled: 1,
  magicDiceDurationSeconds: 15,
  robberThreshold: ROBBER_THRESHOLD_MAX,
  resourcesMultiplier: MAX_MULTIPLIER,
  woodBonus: MAX_BONUS,
  sheepBonus: MAX_BONUS,
  brickBonus: MAX_BONUS,
  oreBonus: MAX_BONUS,
  wheatBonus: MAX_BONUS,
};

export const CLASSIC_PRESET: SettingsData = {
  gameboardLayout: GameboardLayout.CLASSIC_LAYOUT,
  turnDurationSeconds: TIME_DFLT,
  tradeLimit: TRADE_LIMIT_DFLT,
  buildLimit: BUILD_LIMIT_DFLT,
  specialPortOfferRate: SPECIAL_PORT_OFFER_RATE_DFLT,
  genericPortOfferRate: GENERIC_PORT_OFFER_RATE_DFLT,
  reserveOfferRate: RESERVE_OFFER_RATE_DFLT,
  settlementPoints: SETTLEMENT_POINT_DFLT,
  cityPoints: CITY_POINT_DFLT,
  pointsToWin: POINTS_TO_WIN_DFLT,
  roadPoints: ROAD_POINT_DFLT,
  magicDiceEnabled: 0,
  magicDiceDurationSeconds: 20,
  robberThreshold: ROBBER_THRESHOLD_DFLT,
  resourcesMultiplier: 1,
  woodBonus: 0,
  sheepBonus: 0,
  brickBonus: 0,
  oreBonus: 0,
  wheatBonus: 0,
};

/***********************************
 * Magic Dice
 **********************************/
export const MagicDiceRule = {
  /** Resources: +1 for everybody */
  EXTRA_RESOURCES: 'Extra Resources',
  /** Resources: -1 for everybody */
  RESOURCES_CRISIS: 'Resources Crisis',
  /** Resources: +2 for the roller */
  WEALTHY_LANDLORD: 'Wealthy Landlord',
  /** Resources: -2 for the roller */
  POOR_LANDLORD: 'Poor Landlord',
  /** VPs: +1 for everybody */
  ALL_BLESSED: 'All Blessed',
  /** VPs: +2 for everybody */
  BLESSED_ONE: 'Blessed One',
  /** VPs: -1 for the roller */
  CURSED_ONE: 'Cursed One',
  /** Trades: 1:1 everywhere */
  SALES: 'Sales',
  /** Trades: *+1:1 everywhere */
  INFLATION: 'Inflation',
  /** Turn: all players banned except the roller */
  BAN_THEM: 'Ban Them',
  /** Turn: player is ban for the next round */
  BAN_ME: 'Ban Me',
} as const;
export type MagicDiceRule = (typeof MagicDiceRule)[keyof typeof MagicDiceRule];

export const MAGIC_DICE_RULES: Record<MagicDiceRule, string> = {
  [MagicDiceRule.EXTRA_RESOURCES]: `${MagicDiceRule.EXTRA_RESOURCES}: +1 resources production`,
  [MagicDiceRule.RESOURCES_CRISIS]: `${MagicDiceRule.RESOURCES_CRISIS}: -1 resources production`,
  [MagicDiceRule.WEALTHY_LANDLORD]: `${MagicDiceRule.WEALTHY_LANDLORD}: +2 resources production`,
  [MagicDiceRule.POOR_LANDLORD]: `${MagicDiceRule.POOR_LANDLORD}: -2 resources production`,
  [MagicDiceRule.ALL_BLESSED]: `${MagicDiceRule.ALL_BLESSED}: +1 victory points`,
  [MagicDiceRule.BLESSED_ONE]: `${MagicDiceRule.BLESSED_ONE}: +2 victory points`,
  [MagicDiceRule.CURSED_ONE]: `${MagicDiceRule.CURSED_ONE}: -1 victory points`,
  [MagicDiceRule.SALES]: `${MagicDiceRule.SALES}: all trade ratios at 1:1`,
  [MagicDiceRule.INFLATION]: `${MagicDiceRule.INFLATION}: all trade ratios at X+1:1`,
  [MagicDiceRule.BAN_THEM]: `${MagicDiceRule.BAN_THEM}: all players banned for next round`,
  [MagicDiceRule.BAN_ME]: `${MagicDiceRule.BAN_ME}: will be banned for next round`,
} as const;

export const RULE_BY_TOTAL: Record<number, MagicDiceRule> = {
  2: MagicDiceRule.EXTRA_RESOURCES,
  3: MagicDiceRule.RESOURCES_CRISIS,
  4: MagicDiceRule.WEALTHY_LANDLORD,
  5: MagicDiceRule.POOR_LANDLORD,
  6: MagicDiceRule.ALL_BLESSED,
  7: MagicDiceRule.BLESSED_ONE,
  8: MagicDiceRule.CURSED_ONE,
  9: MagicDiceRule.SALES,
  10: MagicDiceRule.INFLATION,
  11: MagicDiceRule.BAN_THEM,
  12: MagicDiceRule.BAN_ME,
};

export type MagicDiceEffectKind = 'resource' | 'trade' | 'turn' | 'victoryPoint';
export type MagicDiceEffectTarget = 'personal' | 'collective';
export type MagicDiceEffectSign = 'plus' | 'minus';

export type MagicDiceEffect = {
  kind: MagicDiceEffectKind;
  target: MagicDiceEffectTarget;
  sign: MagicDiceEffectSign;
  val: number;
};

export const EFFECT_BY_RULE: Record<MagicDiceRule, MagicDiceEffect> = {
  [MagicDiceRule.EXTRA_RESOURCES]: { kind: 'resource', target: 'collective', sign: 'plus', val: 1 },
  [MagicDiceRule.RESOURCES_CRISIS]: { kind: 'resource', target: 'collective', sign: 'minus', val: 1 },
  [MagicDiceRule.WEALTHY_LANDLORD]: { kind: 'resource', target: 'personal', sign: 'plus', val: 2 },
  [MagicDiceRule.POOR_LANDLORD]: { kind: 'resource', target: 'personal', sign: 'minus', val: 2 },
  [MagicDiceRule.ALL_BLESSED]: { kind: 'victoryPoint', target: 'collective', sign: 'plus', val: 1 },
  [MagicDiceRule.BLESSED_ONE]: { kind: 'victoryPoint', target: 'personal', sign: 'plus', val: 2 },
  [MagicDiceRule.CURSED_ONE]: { kind: 'victoryPoint', target: 'personal', sign: 'minus', val: 1 },
  [MagicDiceRule.SALES]: { kind: 'trade', target: 'collective', sign: 'plus', val: 1 },
  [MagicDiceRule.INFLATION]: { kind: 'trade', target: 'collective', sign: 'minus', val: 1 },
  [MagicDiceRule.BAN_THEM]: { kind: 'turn', target: 'collective', sign: 'minus', val: 0 },
  [MagicDiceRule.BAN_ME]: { kind: 'turn', target: 'personal', sign: 'minus', val: 0 },
};

export type MagicDiceEffectResolved = MagicDiceEffect & { roller: string };

export type MagicDiceDto = {
  firstRoll: DiceRoll;
  secondRoll: DiceRoll;
  currentRoll: DiceRoll;
  rollCount: number;
  lastRoller: string | null;
  rule: MagicDiceRule | null;
  ruleLabel: string | null;
  isMalus: boolean | null;
  isPersonnal: boolean | null;
  log: string | null;
  canRoll: boolean;
  effect: MagicDiceEffect | null;
};
