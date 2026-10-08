/** @prop x, y → corner's axial coordinates */
export interface Vertex {
  id: string;       // "{q}:{r}:{cornerIndex}"
  x: number;
  y: number;
}

/** @prop p1, p2 → segment between two vertices (corner to corner) */
export interface Edge {
  id: string;       // "{vertexId1}-{vertexId2}"
  p1: Vertex;
  p2: Vertex;
}

/** @description common definition for all interactive game features */
export interface InteractiveProps<T> {
  data: T;
  isSelected: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onClick: (data: T) => void;
}

/** @prop q = column, r = row → center coordinates of a tile */
export interface TileData {
  q: number;
  r: number;
}

export interface RoadData {
  id: string;
  edge: Edge;
  hasOwner?: boolean;
  //owner?: PlayerId;
}

export interface SettlementData {
  id: string;
  vertex: Vertex;
  hasOwner?: boolean;
  //owner?: PlayerId;
}

export interface TileProps extends InteractiveProps<TileData> { }
export interface RoadProps extends InteractiveProps<RoadData> { }
export interface SettlementProps extends InteractiveProps<SettlementData> { }

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

/** @description classic Catan gameboard layout (19 tiles) */
export const classicLayout: TileData[] = [
    { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },
    { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },
    { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 },
    { q: -2, r: 1 },{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },
    { q: -2, r: 2 },{ q: -1, r: 2 }, { q: 0, r: 2 }
];
