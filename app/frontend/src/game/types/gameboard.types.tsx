export const HEX_SIZE = 50;

export interface HexCoord {
  q: number;
  r: number;
}

export interface Vertex {
  id: string;       // "{q}:{r}:{cornerIndex}"
  x: number;
  y: number;
}

export interface Edge {
  id: string;       // "{vertexId1}-{vertexId2}"
  p1: Vertex;
  p2: Vertex;
}

export interface TileData extends HexCoord {}

export interface SettlementData {
  id: string;
  vertex: Vertex;
}

export interface RoadData {
  id: string;
  edge: Edge;
}
export interface RoadHover {
  type: 'road';
  id: string;
}

export interface TileHover {
  type: 'tile';
  q: number;
  r: number;
}

export interface SettlementHover {
  type: 'settlement';
  id: string;
}

export type HoverEntity = TileHover | RoadHover | SettlementHover | null;

// classic Catan gameboard layout
export const tilesLayout: TileData[] = [
    { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },                                // ROW 1
    { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },              // ROW 2
    { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, // ROW 3
    { q: -2, r: 1 },{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },                  // ROW 4
    { q: -2, r: 2 },{ q: -1, r: 2 }, { q: 0, r: 2 }                                   // ROW 5
];
