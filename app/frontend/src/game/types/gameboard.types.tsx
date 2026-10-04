/** @prop x, y → corner's axial coordinates */
export interface Vertex {
  id: string;       // "{q}:{r}:{cornerIndex}"
  x: number;
  y: number;
}

/** @prop Vertex, Vertex → segment between two vertices(corner to corner) */
export interface Edge {
  id: string;       // "{vertexId1}-{vertexId2}"
  p1: Vertex;
  p2: Vertex;
}

/** @prop q, r → center coordinates(column & row) of a tile */
export interface TileData {
  q: number;
  r: number;
}

export interface RoadData {
  id: string;
  edge: Edge;
}

export interface SettlementData {
  id: string;
  vertex: Vertex;
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
    { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },                                // ROW 1
    { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },              // ROW 2
    { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, // ROW 3
    { q: -2, r: 1 },{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },                  // ROW 4
    { q: -2, r: 2 },{ q: -1, r: 2 }, { q: 0, r: 2 }                                   // ROW 5
];
