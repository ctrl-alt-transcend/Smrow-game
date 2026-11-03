import type { Player } from "./game.types.ts";

export const SELECTED_COLOR = '#c30000';
export const HOVER_COLOR = '#ff0f0f';
export const DEFAULT_COLOR = '#e4e4e4';

export const RENDER_SIZE = 50;
export const HEX_SIZE = RENDER_SIZE;
export const SETTLEMENT_SIZE = RENDER_SIZE / 6;
export const ROAD_SIZE = RENDER_SIZE / 8;
export const HOVER_EFFECT = 1.4;

export const RessourceType = {
  WOOD: 'wood',
  SHEEP: 'sheep',
  HILL: 'brick',
  MOUNTAIN: 'rock',
  FIELD: 'hay'
} as const;

export const LandType = {
  FOREST: 'forest',
  PASTURE: 'pasture',
  HILL: 'hill',
  MOUNTAIN: 'mountain',
  FIELD: 'field',
  DESERT: 'desert',
  DEFAULT: 'default'
} as const;

export const LAND_COLORS: Record<LandType, string> = {
  [LandType.FOREST]: '#4a7c2e',
  [LandType.PASTURE]: '#96d682',
  [LandType.HILL]: '#c49b5a',
  [LandType.MOUNTAIN]: '#8a8a8a',
  [LandType.FIELD]: '#f5e68a',
  [LandType.DESERT]: '#e8cfa0',
  [LandType.DEFAULT]: '#7e00c7d7'
};
export type LandType = (typeof LandType)[keyof typeof LandType];

export const Faction = {
  POURPRES_CHYBRES: 'Pourpres Chybres',
  BOURSES_BLEUES: 'Bourses Bleues',
  ROSES_FIACS: 'Roses Fiacs',
  UREE_JAUNE: 'Uree Jaune',
  DEFAULT: 'Kikouneurs (default)',
  UNOCCUPIED: 'unoccupied ...'
} as const;
export const FACTION_COLORS: Record<Faction, string> = {
  [Faction.POURPRES_CHYBRES]: '#6b0b91',
  [Faction.BOURSES_BLEUES]: '#53cef3',
  [Faction.ROSES_FIACS]: '#ff9595',
  [Faction.UREE_JAUNE]: '#ffc400',
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
}

export interface BuildData {
  faction: Faction;
  hasOwner?: boolean;
}

export interface RoadData extends BuildData {
  id: string;
  edge: Edge;
  //faction: Faction;
  //hasOwner?: boolean;
}

export interface SettlementData extends BuildData {
  id: string;
  vertex: Vertex;
  //faction: Faction;
  //hasOwner?: boolean;
  //isCity?: boolean;
}

/** @description sent to the front, serializable without risk */
export interface GameBoard {
  layout: TileData[];
  vertices: Vertex[];
  edges: Edge[];
  settlements: SettlementData[];
  roads: RoadData[];
  svgBounds: SvgBounds;
}

/** @description keeps relations between each gameboard's elements*/
export interface ConnectedElements {
  /** @description keeps for one road every "neighbours" roads (up to 4 neighbours)*/
  connectedRoads: RoadData[];
  /** @description keeps for one road every settlement it is touching (up to 2 settlements)*/
  adjacentSettlements: SettlementData[];
  /** @description keeps for one settlement every "neighbours" settlement (up to 3 neighbours)*/
  connectedSettlements: SettlementData[];
  /** @description keeps for one settlement every hex tiles it is touching (up to 3 hex tiles -> lands)*/
  adjacentTiles: TileData[];
}

/** @description retained on the back-end only, never sent to front */
export type GameBoardGraph = Map<string, ConnectedElements>;

/**
 * @key settlement id
 * @value player who built
*/
export type Buildings = Map<string, Player>;

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2, land: LandType.FOREST, value: 2 }, { q: 1, r: -2, land: LandType.PASTURE, value: 9 }, { q: 2, r: -2, land: LandType.MOUNTAIN, value: 8 },
    { q: -1, r: -1, land: LandType.PASTURE, value: 11 }, { q: 0, r: -1, land: LandType.HILL, value: 6 }, { q: 1, r: -1, land: LandType.FIELD, value: 5 }, { q: 2, r: -1, land: LandType.MOUNTAIN, value: 4 },
    { q: -2, r: 0, land: LandType.FIELD, value: 12 }, { q: -1, r: 0, land: LandType.FIELD, value: 5 }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10 }, { q: 1, r: 0, land: LandType.FOREST, value: 3 }, { q: 2, r: 0, land: LandType.PASTURE, value: 9 },
    { q: -2, r: 1, land: LandType.PASTURE, value:6 },{ q: -1, r: 1, land: LandType.FOREST, value: 4 }, { q: 0, r: 1, land: LandType.FOREST, value: 11 }, { q: 1, r: 1, land: LandType.HILL, value: 8 },
    { q: -2, r: 2, land: LandType.HILL, value: 8 },{ q: -1, r: 2, land: LandType.DESERT, value: 10 }, { q: 0, r: 2, land: LandType.FIELD, value: 12 }
];
