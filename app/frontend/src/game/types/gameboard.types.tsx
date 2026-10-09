export const SELECTED_COLOR = '#e30000';
export const HOVER_COLOR = '#fe5b5b';
export const DEFAULT_COLOR = '#e4e4e4';

export enum LandType {
  FOREST = 'forest',
  PASTURE = 'pasture',
  HILL = 'hill',
  MOUNTAIN = 'mountain',
  FIELD = 'field',
  DESERT = 'desert'
}

export const LAND_COLORS: Record<LandType, string> = {
  [LandType.FOREST]: '#4a7c2e',
  [LandType.PASTURE]: '#96d682',
  [LandType.HILL]: '#c49b5a',
  [LandType.MOUNTAIN]: '#8a8a8a',
  [LandType.FIELD]: '#f5e68a',
  [LandType.DESERT]: '#e8cfa0'
};

export enum Faction {
  POURPRE_CHYBRE = 'pourpre',
  BOURSE_BLEUE = 'bleu',
  ROUGE_FIAC = 'vert',
  UREE_JAUNE = 'jaune',
}

export const FACTION_COLORS: Record<Faction, string> = {
  [Faction.POURPRE_CHYBRE]: '#6b0b91',
  [Faction.BOURSE_BLEUE]: '#19aad5',
  [Faction.ROUGE_FIAC]: '#da1111',
  [Faction.UREE_JAUNE]: '#ffdd00'
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

/** @description common definition for all interactive game features */
export interface InteractiveProps<T> {
  data: T;
  isSelected: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onClick: (data: T) => void;
  hasOwner?: boolean | null;
  //owner?: PlayerId | null;

}

/** @description q = column, r = row → center coordinates of a tile */
export interface TileData {
  q: number;
  r: number;
  land: LandType | null;
}
export interface TileProps extends InteractiveProps<TileData> { }

export interface RoadData {
  id: string;
  edge: Edge;
  faction: Faction | null;
  hasOwner?: boolean;
}
export interface RoadProps extends InteractiveProps<RoadData> { }

export interface SettlementData {
  id: string;
  vertex: Vertex;
  faction: Faction | null;
  hasOwner?: boolean;
}
export interface SettlementProps extends InteractiveProps<SettlementData> { }

export interface GameBoardData {
  vertices: Vertex[];
  edges: Edge[];
  settlements: SettlementData[];
  roads: RoadData[];
  svgBounds: SvgBounds;
}

/** @description set selected interactive element */
export interface GameBoardState {
  selectedTile: TileData | null;
  selectedSettlement: SettlementData | null;
  selectedRoad: RoadData | null;
}

// Hover effects
export interface TileHover {
  type: 'tile';
  q: number;
  r: number;
}

export interface RoadHover {
  type: 'road';
  id: string;
}

export interface SettlementHover {
  type: 'settlement';
  id: string;
}

export type HoverEntity = TileHover | RoadHover | SettlementHover | null;

export interface GameBoardProps {
  boardData: GameBoardData;

  //useGameBoardSelection
  selected: GameBoardState;
  handleTileClick: (tile: TileData | null) => void;
  handleSettlementClick: (settlement: SettlementData | null) => void;
  handleRoadClick: (road: RoadData | null) => void;
  clearSelection: () => void;

  //useGameBoardHover
  hovered: HoverEntity;
  handleTileHover: (isHovered: boolean, tile: TileData) => void;
  handleRoadHover: (isHovered: boolean, road: RoadData) => void;
  handleSettlementHover: (isHovered: boolean, settlement: SettlementData) => void;
  isTileHovered: (tile: TileData) => boolean;
  isRoadHovered: (road: RoadData) => boolean;
  isSettlementHovered: (settlement: SettlementData) => boolean;
}

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2, land: LandType.FOREST }, { q: 1, r: -2, land: LandType.PASTURE }, { q: 2, r: -2, land: LandType.MOUNTAIN },
    { q: -1, r: -1, land: LandType.FOREST }, { q: 0, r: -1, land: LandType.HILL }, { q: 1, r: -1, land: LandType.FIELD }, { q: 2, r: -1, land: LandType.MOUNTAIN },
    { q: -2, r: 0, land: LandType.FIELD }, { q: -1, r: 0, land: LandType.FIELD }, { q: 0, r: 0, land: LandType.MOUNTAIN }, { q: 1, r: 0, land: LandType.FOREST }, { q: 2, r: 0, land: LandType.PASTURE },
    { q: -2, r: 1, land: LandType.PASTURE },{ q: -1, r: 1, land: LandType.HILL }, { q: 0, r: 1, land: LandType.FOREST }, { q: 1, r: 1, land: LandType.HILL },
    { q: -2, r: 2, land: LandType.HILL },{ q: -1, r: 2, land: LandType.DESERT }, { q: 0, r: 2, land: LandType.FIELD }
];
