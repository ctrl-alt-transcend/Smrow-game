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
}

/** @description q = column, r = row → center coordinates of a tile */
export interface TileData {
  q: number;
  r: number;
}
export interface TileProps extends InteractiveProps<TileData> { }

export interface RoadData {
  id: string;
  edge: Edge;
  hasOwner?: boolean;
  //owner?: PlayerId;
}
export interface RoadProps extends InteractiveProps<RoadData> { }

export interface SettlementData {
  id: string;
  vertex: Vertex;
  hasOwner?: boolean;
  //owner?: PlayerId;
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
  clearAll: () => void;

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
    { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
    { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
    { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
    { q: -2, r: 1 },{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
    { q: -2, r: 2 },{ q: -1, r: 2 }, { q: 0, r: 2 }
];

