import {
  type Vertex,
  type Edge,
  type TileData,
  type RoadData,
  type SettlementData,
  type CoastData,
  type PortData,
  type GameBoard,
  type ConnectedElements,
  type GameBoardGraph,
  HEX_SIZE,
  WATER_WIDTH,
  Faction,
} from '@shared/game/gameboard.types';
import { getHexCorners, getHexEdges } from '@shared/game/hexCalculation';

/* ================================================================== *
 * initGameBoard
 * ================================================================== */

/** @description calculate and render an SVG board game based on the given layout */
export const initGameBoard = (tiles: TileData[]): GameBoard => {
  const allVertices = new Map<string, Vertex>();
  const allEdges = new Map<string, Edge>();

  tiles.forEach((tile) => {
    getHexCorners(tile.q, tile.r, HEX_SIZE).forEach((v) => {
      allVertices.set(v.id, v);
    });
    getHexEdges(tile.q, tile.r, HEX_SIZE).forEach((e) => {
      allEdges.set(e.id, e);
    });
  });

  const settlements: SettlementData[] = Array.from(
    allVertices.values(),
    (v) => ({
      id: v.id,
      vertex: v,
      faction: Faction.UNOCCUPIED,
      ownerId: null,
      isCity: false,
    }),
  );

  const roads: RoadData[] = Array.from(allEdges.values(), (e) => ({
    id: e.id,
    edge: e,
    faction: Faction.UNOCCUPIED,
    ownerId: null,
  }));

  const coasts = generateCoasts(tiles);
  const margin = 50;
  const allPoints: Array<{ x: number; y: number }> = [
    ...Array.from(allVertices.values()),
  ];
  for (const coast of coasts) {
    const { edge, normal } = coast;
    allPoints.push(
      edge.p1,
      edge.p2,
      { x: edge.p1.x + normal.x * WATER_WIDTH, y: edge.p1.y + normal.y * WATER_WIDTH },
      { x: edge.p2.x + normal.x * WATER_WIDTH, y: edge.p2.y + normal.y * WATER_WIDTH },
    );
  }

  const bounds = allPoints.reduce(
    (acc, v) => ({
      minX: Math.min(acc.minX, v.x),
      maxX: Math.max(acc.maxX, v.x),
      minY: Math.min(acc.minY, v.y),
      maxY: Math.max(acc.maxY, v.y),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  );

  const svgWidth = bounds.maxX - bounds.minX + margin * 2;
  const svgHeight = bounds.maxY - bounds.minY + margin * 2;
  const offsetX = bounds.minX - margin;
  const offsetY = bounds.minY - margin;

  return {
    layout: tiles,
    vertices: Array.from(allVertices.values()),
    edges: Array.from(allEdges.values()),
    settlements,
    roads,
    coasts,
    svgBounds: { svgWidth, svgHeight, offsetX, offsetY },
  };
};

/* ------------------------------------------------------------------ *
 * Coast generation
 * ------------------------------------------------------------------ */
const AXIAL_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

const axialKey = (q: number, r: number): string => `${q},${r}`;

/**deterministic hash (the board must remain reproducible; no Math.random)*/
const deterministicHash = (q: number, r: number, salt = 0): number => {
  const n = Math.sin((q + salt) * 127.1 + (r + salt * 7) * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

/**canonical key of an edge, independent of the p1/p2 order*/
const edgeKey = (a: Vertex, b: Vertex): string =>
  a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;

/**
* @description Generates a CoastData object for each outer edge (bordering the ocean).
* Detection: an edge is considered coastal if it is not shared by any OTHER
* land tile. The normals point away from the tile (toward the sea).
*/
const generateCoasts = (tiles: TileData[]): CoastData[] => {
  const sharedEdgeKeys = new Set<string>();
  const edgeKeyCount = new Map<string, number>();
  for (const tile of tiles) {
    for (const e of getHexEdges(tile.q, tile.r, HEX_SIZE)) {
      const key = edgeKey(e.p1, e.p2);
      edgeKeyCount.set(key, (edgeKeyCount.get(key) ?? 0) + 1);
    }
  }
  for (const [key, count] of edgeKeyCount) {
    if (count > 1) sharedEdgeKeys.add(key);
  }

  const coasts: CoastData[] = [];

  for (const tile of tiles) {
    const corners = getHexCorners(tile.q, tile.r, HEX_SIZE);
    const center = corners.reduce(
      (acc, c) => ({ x: acc.x + c.x / corners.length, y: acc.y + c.y / corners.length }),
      { x: 0, y: 0 },
    );

    for (const e of getHexEdges(tile.q, tile.r, HEX_SIZE)) {
      if (sharedEdgeKeys.has(edgeKey(e.p1, e.p2))) continue; // arête intérieure

      const midX = (e.p1.x + e.p2.x) / 2;
      const midY = (e.p1.y + e.p2.y) / 2;
      const dx = midX - center.x;
      const dy = midY - center.y;
      const len = Math.hypot(dx, dy) || 1;

      coasts.push({
        id: `coast:${e.id}`,
        tile: { q: tile.q, r: tile.r },
        edge: e,
        normal: { x: dx / len, y: dy / len, id: ''},
        port: null,
      });
    }
  }

  placePorts(coasts, tiles);

  return coasts;
};

const SPECIALIZED_PORT_COUNT = 5;
const GENERIC_PORT_COUNT = 4;

const placePorts = (
  coasts: CoastData[],
  tiles: TileData[]
) => {
  const coastsByTile = new Map<string, CoastData[]>();
  for (const c of coasts) {
    const key = axialKey(c.tile.q, c.tile.r);
    const bucket = coastsByTile.get(key);
    if (bucket) bucket.push(c);
    else coastsByTile.set(key, [c]);
  }

  // Candidate tiles: possess at least one edge, deterministic sorting
  const candidates = tiles
    .filter((t) => coastsByTile.has(axialKey(t.q, t.r)))
    .sort(
      (a, b) =>
        deterministicHash(a.q, a.r) - deterministicHash(b.q, b.r),
    );

  const chosenTiles: TileData[] = [];
  const chosenKeys = new Set<string>();

  for (const tile of candidates) {
    if (chosenTiles.length >= SPECIALIZED_PORT_COUNT + GENERIC_PORT_COUNT) break;

    // No two ports on adjacent tiles (avoids "port clusters")
    const tooClose = AXIAL_DIRECTIONS.some(([dq, dr]) =>
      chosenKeys.has(axialKey(tile.q + dq, tile.r + dr)),
    );
    if (tooClose) continue;

    chosenTiles.push(tile);
    chosenKeys.add(axialKey(tile.q, tile.r));
  }

  chosenTiles.forEach((tile, index) => {
    const tileCoasts =
      coastsByTile.get(axialKey(tile.q, tile.r)) ?? [];
    if (tileCoasts.length === 0) return;

   // Deterministic choice of the edge that carries the port
    const seed = deterministicHash(tile.q + 13, tile.r + 7);
    const coast = tileCoasts[Math.floor(seed * tileCoasts.length) % tileCoasts.length];

    const port: PortData = {
      id: `port:${tile.q},${tile.r}`,
      // TODO ASSIGN PORT TYPE
      type: 'wood',
        //type: index < SPECIALIZED_PORT_COUNT
        //  ? SPECIALTIES[index % SPECIALTIES.length]
        //  : 'generic',
      coastId: coast.id,
    };
    coast.port = port;
  });
};

/* ------------------------------------------------------------------ *
 * Graph (inchangé)
 * ------------------------------------------------------------------ */
const emptyConnections = (): ConnectedElements => ({
  connectedRoads: [],
  connectedSettlements: [],
  adjacentTiles: [],
  adjacentSettlements: [],
});

/** @description reserves an entry in the graph and detects ID collisions */
const register = (graph: GameBoardGraph, id: string): ConnectedElements => {
  if (graph.has(id)) {
    throw new Error(`[linkGameBoard] dupplicate id found: "${id}"`);
  }
  const entry = emptyConnections();
  graph.set(id, entry);
  return entry;
};

/** @description vertexId → routes touching this vertex (2 entries per route) */
const indexRoadsByVertex = (roads: RoadData[]): Map<string, RoadData[]> => {
  const index = new Map<string, RoadData[]>();

  for (const road of roads) {
    for (const vertexId of [road.edge.p1.id, road.edge.p2.id]) {
      const bucket = index.get(vertexId);
      if (bucket) bucket.push(road);
      else index.set(vertexId, [road]);
    }
  }

  return index;
};

/** @description vertexId → tiles for which this vertex serves as a corner (6 entries per tile) */
const indexTilesByVertex = (tiles: TileData[]): Map<string, TileData[]> => {
  const index = new Map<string, TileData[]>();

  for (const tile of tiles) {
    for (const corner of getHexCorners(tile.q, tile.r, HEX_SIZE)) {
      const bucket = index.get(corner.id);
      if (!bucket) index.set(corner.id, [tile]);
      else if (!bucket.includes(tile)) bucket.push(tile);
    }
  }

  return index;
};

const byId = <T extends { id: string }>(a: T, b: T): number =>
  a.id.localeCompare(b.id);

/**
 * @description Builds the adjacency graph from the board.
 * CRITICAL ORDER: all indices must be ready BEFORE they are used.
 */
export const linkGameBoard = (board: GameBoard): GameBoardGraph => {
  const graph: GameBoardGraph = new Map();

  // STEP 0: FULL INDEXING (before any use)
  const settlementByVertex = new Map<string, SettlementData>(
    board.settlements.map((s) => [s.vertex.id, s]),
  );
  const roadsByVertex = indexRoadsByVertex(board.roads);
  const tilesByVertex = indexTilesByVertex(board.layout);

  // STEP 1: Creating empty entries
  for (const road of board.roads) register(graph, road.id);
  for (const settlement of board.settlements) register(graph, settlement.id);

  // STEP 2: Roads ↔ Roads
  for (const road of board.roads) {
    const neighbours = new Map<string, RoadData>();

    for (const vertexId of [road.edge.p1.id, road.edge.p2.id]) {
      for (const candidate of roadsByVertex.get(vertexId) ?? []) {
        if (candidate.id !== road.id) neighbours.set(candidate.id, candidate);
      }
    }

    graph.get(road.id)!.connectedRoads = [...neighbours.values()].sort(byId);
  }

  // STEP 3: Roads ↔ Settlements
  for (const road of board.roads) {
    const entry = graph.get(road.id);
    if (!entry) continue;

    const adjacent: SettlementData[] = [];

    const s1 = settlementByVertex.get(road.edge.p1.id);
    if (s1) adjacent.push(s1);

    const s2 = settlementByVertex.get(road.edge.p2.id);
    if (s2 && s2.id !== s1?.id) adjacent.push(s2);

    entry.adjacentSettlements = adjacent;
  }

  // STEP 4: Settlements ↔ Settlements
  for (const edge of board.edges) {
    const a = settlementByVertex.get(edge.p1.id);
    const b = settlementByVertex.get(edge.p2.id);

    if (!a || !b || a.id === b.id) continue;

    graph.get(a.id)!.connectedSettlements.push(b);
    graph.get(b.id)!.connectedSettlements.push(a);
  }

  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.connectedSettlements.sort(byId);
  }

  // STEP 5: Settlements ↔ Tiles
  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.adjacentTiles =
      tilesByVertex.get(settlement.vertex.id) ?? [];
  }

  return graph;
};

export interface LinkedGameBoard {
  board: GameBoard;
  graph: GameBoardGraph;
}

export const createGameBoard = (tiles: TileData[]): LinkedGameBoard => {
  const board = initGameBoard(tiles);
  return { board, graph: linkGameBoard(board) };
};

export const getConnections = (
  graph: GameBoardGraph,
  elementId: string,
): ConnectedElements | undefined => graph.get(elementId);

/* ================================================================== *
 * DEBUG HELPERS
 * ================================================================== */

export const debugPrintConnections = (
  graph: GameBoardGraph,
  kind: 'road' | 'settlement',
  id: string,
) => {
  const entry = graph.get(id);
  if (!entry) {
    console.log(`⛔ ${kind}:${id} NOT FOUND in graph`);
    return;
  }

  if (kind === 'road') {
    console.log(`🛣️ Road ${id}:`);
    console.log(
      `   ├─ connectedRoads (${entry.connectedRoads.length}): ${entry.connectedRoads.map((r) => r.id).join(', ')}`,
    );
    console.log(
      `   └─ adjacentSettlements (${entry.adjacentSettlements.length}): ${entry.adjacentSettlements.map((s) => s.id).join(', ')}`,
    );
  } else {
    console.log(`🏘️ Settlement ${id}:`);
    console.log(
      `   ├─ connectedSettlements (${entry.connectedSettlements.length}): ${entry.connectedSettlements.map((s) => s.id).join(', ')}`,
    );
    console.log(
      `   └─ adjacentTiles (${entry.adjacentTiles.length}): ${entry.adjacentTiles.map((t) => `${t.q},${t.r}`).join(', ')}`,
    );
  }
};

export const debugPrintCoasts = (board: GameBoard) => {
  const withPorts = board.coasts.filter((c) => c.port);
  console.log(`🏖️ Coastal edges: ${board.coasts.length}, ports: ${withPorts.length}`);
  for (const coast of withPorts) {
    console.log(`   ⚓ ${coast.port!.id} [${coast.port!.type}] on ${coast.id}`);
  }
};
