export const SELECTED_COLOR = '#e30000';
export const HOVER_COLOR = '#fe5b5b';
export const DEFAULT_COLOR = '#e4e4e4';

export const LandType = {
  FOREST: 'forest',
  PASTURE: 'pasture',
  HILL: 'hill',
  MOUNTAIN: 'mountain',
  FIELD: 'field',
  DESERT: 'desert',
  DEFAULT: 'purple'
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
  POURPRES_CHYBRES: "Pourpres Chybres",
  BOURSES_BLEUES: "Bourses Bleues",
  ROUGES_FIACS: "Rouges Fiacs",
  UREE_JAUNE: "Uree Jaune",
  DEFAULT: "Kikouneurs (default)",
  UNOCCUPIED: "unoccupied ...",
} as const;

export type Faction = (typeof Faction)[keyof typeof Faction];

export const FACTION_COLORS: Record<Faction, string> = {
  [Faction.POURPRES_CHYBRES]: "#6b0b91",
  [Faction.BOURSES_BLEUES]: "#19aad5",
  [Faction.ROUGES_FIACS]: "#da1111",
  [Faction.UREE_JAUNE]: "#ffdd00",
  [Faction.DEFAULT]: "#fd92e4",
  [Faction.UNOCCUPIED]: "#e4e4e4",
};
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
  land: LandType | null;
}

export interface RoadData {
  id: string;
  edge: Edge;
  faction: Faction;
  hasOwner?: boolean;
}

export interface SettlementData {
  id: string;
  vertex: Vertex;
  faction: Faction;
  hasOwner?: boolean;
}

export interface GameBoardData {
  layout: TileData[];
  vertices: Vertex[];
  edges: Edge[];
  settlements: SettlementData[];
  roads: RoadData[];
  svgBounds: SvgBounds;
}

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2, land: LandType.FOREST, value: 2 }, { q: 1, r: -2, land: LandType.PASTURE, value: 9 }, { q: 2, r: -2, land: LandType.MOUNTAIN, value: 8 },
    { q: -1, r: -1, land: LandType.PASTURE, value: 11 }, { q: 0, r: -1, land: LandType.HILL, value: 6 }, { q: 1, r: -1, land: LandType.FIELD, value: 5 }, { q: 2, r: -1, land: LandType.MOUNTAIN, value: 4 },
    { q: -2, r: 0, land: LandType.FIELD, value: 12 }, { q: -1, r: 0, land: LandType.FIELD, value: 5 }, { q: 0, r: 0, land: LandType.MOUNTAIN, value: 10 }, { q: 1, r: 0, land: LandType.FOREST, value: 3 }, { q: 2, r: 0, land: LandType.PASTURE, value: 9 },
    { q: -2, r: 1, land: LandType.PASTURE, value:6 },{ q: -1, r: 1, land: LandType.FOREST, value: 4 }, { q: 0, r: 1, land: LandType.FOREST, value: 11 }, { q: 1, r: 1, land: LandType.HILL, value: 8 },
    { q: -2, r: 2, land: LandType.HILL, value: 8 },{ q: -1, r: 2, land: LandType.DESERT, value: 10 }, { q: 0, r: 2, land: LandType.FIELD, value: 12 }
];
