import type { Player, Resources } from "./game.types";

/** Rules value */
export const SPECIAL_PORT_RATE = 2;
export const GENERIC_PORT_RATE = 3;
export const RESERVE_RATE = 4;
export const SETTLEMENT_POINT = 1;

export const CITY_POINT = 1;
export const POINTS_TO_WIN = 10;

/** Rendering */
export const SELECTED_COLOR = '#c30000';
export const HOVER_COLOR = '#ff0f0f';
export const DEFAULT_COLOR = '#e4e4e4';

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
  ROAD: 'road',
  SETTLEMENT: 'settlement',
  CITY: 'city',
} as const;
export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType];

export const TraderType = {
  SPECIALIZED_PORT: 'specialized port',
  GENERIC_PORT: 'generic port',
  RESERVE: 'reserve',
  PLAYER: 'player'
} as const;
export type TraderType = (typeof TraderType)[keyof typeof TraderType];

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
  FOREST: 'forest',
  PASTURE: 'pasture',
  HILL: 'hill',
  MOUNTAIN: 'mountain',
  FIELD: 'field',
  DESERT: 'desert'
} as const;
export type LandType = (typeof LandType)[keyof typeof LandType];

export const RessourceType = {
  WOOD: 'wood',
  SHEEP: 'sheep',
  BRICK: 'brick',
  ORE: 'ore',
  WHEAT: 'wheat',
  DUST: 'dust'
} as const;
export type RessourceType = (typeof RessourceType)[keyof typeof RessourceType];

export const LAND_RESSOURCE: Record<LandType, string> = {
  [LandType.FOREST]: RessourceType.WOOD,
  [LandType.PASTURE]: RessourceType.SHEEP,
  [LandType.HILL]: RessourceType.BRICK,
  [LandType.MOUNTAIN]: RessourceType.ORE,
  [LandType.FIELD]: RessourceType.WHEAT,
  [LandType.DESERT]: RessourceType.DUST
};

export const LAND_COLORS: Record<LandType, string> = {
  [LandType.FOREST]: '#4a7c2e',
  [LandType.PASTURE]: '#96d682',
  [LandType.HILL]: '#c49b5a',
  [LandType.MOUNTAIN]: '#8a8a8a',
  [LandType.FIELD]: '#f5e68a',
  [LandType.DESERT]: '#e8cfa0'
};

export const Faction = {
  POURPRES_CHYBRES: 'Pourpres Chybres',
  BOURSES_BLEUES: 'Bourses Bleues',
  ROSES_FIACS: 'Roses Fiacs',
  UREE_JAUNE: 'Uree Jaune',
  DEFAULT: 'Kikouneurs (default)',
  UNOCCUPIED: 'unoccupied ...'
} as const;

export const FACTION_COLORS: Record<Faction, string> = {
  [Faction.POURPRES_CHYBRES]: '#cf69f8',
  [Faction.BOURSES_BLEUES]: '#58b6d3',
  [Faction.ROSES_FIACS]: '#f0a1a1',
  [Faction.UREE_JAUNE]: '#f6e823',
  [Faction.DEFAULT]: '#19af89',
  [Faction.UNOCCUPIED]: '#e4e4e4'
};
export type Faction = (typeof Faction)[keyof typeof Faction];

/** @description x, y → corner's axial coordinates */
export interface Vertex {
  id: string;       // "{q}:{r}:{cornerIndex}"
  x: number;
  y: number;
}

/** @description p1, p2 → segment between two vertices (corner to corner) */
export interface Edge {
  id: string;       // "{vertexId1}-{vertexId2}"
  p1: Vertex;
  p2: Vertex;
}

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

export interface BuildData {
  faction: Faction;
  ownerId: string | null;
}

export interface RoadData extends BuildData {
  id: string;
  edge: Edge;
}

export interface SettlementData extends BuildData {
  id: string;
  vertex: Vertex;
  isCity: boolean;
}

export interface CoastData {
  id: string;              // "coast:<edgeId>"
  tile: { q: number; r: number };  // tile land that bears the coast
  edge: Edge;              // the outer edge p1→p2
  normal: Vertex;          // unit vector pointing toward the sea
  port: PortData | null;
}

export type PortType = RessourceType | 'generic';

export interface PortData {
  tileId: string;
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

/** @description keeps relations between each gameboard's elements*/
export interface ConnectedElements {
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
    { q: -2, r: 0, land: LandType.FIELD, value: 12, hasRobber: false }, { q: -1, r: 0, land: LandType.FIELD, value: 5, hasRobber: true }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10, hasRobber: false }, { q: 1, r: 0, land: LandType.FOREST, value: 3, hasRobber: false }, { q: 2, r: 0, land: LandType.PASTURE, value: 9, hasRobber: false },
    { q: -2, r: 1, land: LandType.PASTURE, value:6, hasRobber: false },{ q: -1, r: 1, land: LandType.FOREST, value: 4, hasRobber: false }, { q: 0, r: 1, land: LandType.FOREST, value: 11, hasRobber: false }, { q: 1, r: 1, land: LandType.HILL, value: 8, hasRobber: false },
    { q: -2, r: 2, land: LandType.HILL, value: 8, hasRobber: false },{ q: -1, r: 2, land: LandType.DESERT, value: 10, hasRobber: false }, { q: 0, r: 2, land: LandType.FIELD, value: 12, hasRobber: false }
];
