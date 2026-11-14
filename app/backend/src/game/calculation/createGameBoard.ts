import {
  type Vertex,
  type Edge,
  type TileData,
  type RoadData,
  type SettlementData,
  type CoastData,
  type GameBoard,
  type ConnectedElements,
  type GameBoardGraph,
  HEX_SIZE,
  WATER_WIDTH,
  Faction,
  ResourceType,
  ReserveData,
  CoreElement,
  getHexCorners,
  getHexEdges,
} from 'shared';

/* ================================================================== *
 * initGameBoard
 * ================================================================== */

/** @description calculate and render an SVG board game based on the given layout */
export const initGameBoard = (tiles: TileData[]): GameBoard => {
  const allVertices = new Map<string, Vertex>();
  const allEdges = new Map<string, Edge>();

  /** Randomize tiles */
  //randomizeRobber(tiles); // Robber must start on the desert

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
      {
        x: edge.p1.x + normal.x * WATER_WIDTH,
        y: edge.p1.y + normal.y * WATER_WIDTH,
      },
      {
        x: edge.p2.x + normal.x * WATER_WIDTH,
        y: edge.p2.y + normal.y * WATER_WIDTH,
      },
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

  const reserveRadius = 40;
  const reserve: ReserveData = {
    id: 'reserve',
    position: {
      id: 'reserve-pos',
      x: bounds.minX - reserveRadius * 0.6 + 50,
      y: bounds.minY - reserveRadius * 0.6 + 50,
    },
  };

  return {
    layout: tiles,
    vertices: Array.from(allVertices.values()),
    edges: Array.from(allEdges.values()),
    settlements,
    roads,
    coasts,
    reserve,
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

/** canonical key of an edge, independent of the p1/p2 order */
const edgeKey = (a: Vertex, b: Vertex): string =>
  a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;

/**
 * @description Generates a CoastData object for each outer edge (bordering the ocean).
 * Detection: an edge is considered coastal if it is not shared by any OTHER
 * land tile. The normals point away from the tile (toward the sea).
 * Ports are then assigned: some coasts stay empty, some get a generic port
 * (3:1), some get a specialized port (2:1).
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
      (acc, c) => ({
        x: acc.x + c.x / corners.length,
        y: acc.y + c.y / corners.length,
      }),
      { x: 0, y: 0 },
    );

    for (const e of getHexEdges(tile.q, tile.r, HEX_SIZE)) {
      if (sharedEdgeKeys.has(edgeKey(e.p1, e.p2))) continue; // inner edge

      const midX = (e.p1.x + e.p2.x) / 2;
      const midY = (e.p1.y + e.p2.y) / 2;
      const dx = midX - center.x;
      const dy = midY - center.y;
      const len = Math.hypot(dx, dy) || 1;

      coasts.push({
        id: `coast:${e.id}`,
        tile: { q: tile.q, r: tile.r },
        edge: e,
        normal: { x: dx / len, y: dy / len, id: '' },
        port: null,
      });
    }
  }

  placePorts(coasts, tiles);

  return coasts;
};

const SPECIALIZED_PORT_COUNT = 5;
const GENERIC_PORT_COUNT = 4;
const TOTAL_PORTS = SPECIALIZED_PORT_COUNT + GENERIC_PORT_COUNT;

const SPECIALTIES: ResourceType[] = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

/**
 * Standard Fisher-Yates shuffle using Math.random: the board layout itself
 * stays deterministic (tiles), but ports are intentionally scattered
 * differently on every new game.
 */
const shuffle = <T>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Randomly ordered port types: the 5 first picks receive the shuffled
 * specialties (2:1), the 4 last ones a generic type (3:1).
 * Shuffling the whole sequence would blur the specialized/generic split.
 */
const buildPortTypeOrder = (): (ResourceType | 'generic')[] => [
  ...shuffle(SPECIALTIES),
  ...Array.from({ length: GENERIC_PORT_COUNT }, () => 'generic' as const),
];

/** attach a port to a RANDOM coastal edge of the given tile */
const attachPortToTile = (
  coastsByTile: Map<string, CoastData[]>,
  tile: TileData,
  type: ResourceType | 'generic',
) => {
  const tileCoasts = coastsByTile.get(axialKey(tile.q, tile.r)) ?? [];
  if (tileCoasts.length === 0) return;

  const coast = tileCoasts[Math.floor(Math.random() * tileCoasts.length)];

  coast.port = {
    id: `port:${tile.q},${tile.r}`,
    type,
    coastId: coast.id,
  };
};

/**
 * @description Assigns ports to coastal tiles:
 * 1. Candidate tiles are SHUFFLED (Math.random), so ports spread randomly
 *    around the board on every new game.
 * 2. A tile is skipped if adjacent to an already-chosen tile (avoids port clusters).
 * 3. If fewer than TOTAL_PORTS tiles can be picked without adjacency,
 *    a second pass completes the count by relaxing the adjacency rule.
 * Result: empty coasts (no port), generic ports (3:1) and specialized ports (2:1).
 */
const placePorts = (coasts: CoastData[], tiles: TileData[]) => {
  // group coastal edges by tile
  const coastsByTile = new Map<string, CoastData[]>();
  for (const c of coasts) {
    const key = axialKey(c.tile.q, c.tile.r);
    const bucket = coastsByTile.get(key);
    if (bucket) bucket.push(c);
    else coastsByTile.set(key, [c]);
  }

  // candidate tiles: possess at least one coastal edge, random order
  const candidates = shuffle(
    tiles.filter((t) => coastsByTile.has(axialKey(t.q, t.r))),
  );

  const chosenKeys = new Set<string>();
  const chosenTiles: TileData[] = [];

  // PASS 1: pick tiles, never adjacent to an already-chosen one
  for (const tile of candidates) {
    if (chosenTiles.length >= TOTAL_PORTS) break;

    const tooClose = AXIAL_DIRECTIONS.some(([dq, dr]) =>
      chosenKeys.has(axialKey(tile.q + dq, tile.r + dr)),
    );
    if (tooClose) continue;

    chosenTiles.push(tile);
    chosenKeys.add(axialKey(tile.q, tile.r));
  }

  // PASS 2: fallback — relax adjacency to guarantee the exact port count
  if (chosenTiles.length < TOTAL_PORTS) {
    for (const tile of candidates) {
      if (chosenTiles.length >= TOTAL_PORTS) break;
      if (chosenKeys.has(axialKey(tile.q, tile.r))) continue;
      chosenTiles.push(tile);
      chosenKeys.add(axialKey(tile.q, tile.r));
    }
  }

  const typeOrder = buildPortTypeOrder();

  chosenTiles.forEach((tile, index) => {
    attachPortToTile(coastsByTile, tile, typeOrder[index % typeOrder.length]);
  });
};

/* ------------------------------------------------------------------ *
 * Graph
 * ------------------------------------------------------------------ */
/** @description reserves an entry in the graph and detects ID collisions */
const register = (
  graph: GameBoardGraph,
  id: string,
  core: CoreElement,
): ConnectedElements => {
  if (graph.has(id)) {
    throw new Error(`[linkGameBoard] dupplicate id found: "${id}"`);
  }
  const entry: ConnectedElements = {
    core,
    connectedRoads: [],
    neighboursSettlements: [],
    adjacentTiles: [],
    connectedSettlements: [],
  };
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
  for (const road of board.roads) {
    register(graph, road.id, { type: 'road', data: road });
  }
  for (const settlement of board.settlements) {
    register(graph, settlement.id, { type: 'settlement', data: settlement });
  }
  for (const coast of board.coasts) {
    if (coast.port) {
      register(graph, coast.port.id, { type: 'port', data: coast.port });
    }
  }

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

  // STEP 3: Roads ↔ Settlements (BOTH directions)
  // road.connectedSettlements = the settlements touching this road (0-2)
  // settlement.connectedRoads = the roads touching this settlement (0-3)
  // The second direction is REQUIRED by rules like crossRoadsRule, which
  // counts the owned roads around a settlement from the graph.
  for (const road of board.roads) {
    const entry = graph.get(road.id)!;

    const adjacent: SettlementData[] = [];

    const s1 = settlementByVertex.get(road.edge.p1.id);
    if (s1) adjacent.push(s1);

    const s2 = settlementByVertex.get(road.edge.p2.id);
    if (s2 && s2.id !== s1?.id) adjacent.push(s2);

    entry.connectedSettlements = adjacent;

    // reverse direction: register this road on each adjacent settlement
    for (const settlement of adjacent) {
      graph.get(settlement.id)!.connectedRoads.push(road);
    }
  }

  // Sort the settlements' roads for a stable, reproducible graph
  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.connectedRoads.sort(byId);
  }

  // STEP 4: Settlements ↔ Settlements
  for (const edge of board.edges) {
    const a = settlementByVertex.get(edge.p1.id);
    const b = settlementByVertex.get(edge.p2.id);

    if (!a || !b || a.id === b.id) continue;

    graph.get(a.id)!.neighboursSettlements.push(b);
    graph.get(b.id)!.neighboursSettlements.push(a);
  }

  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.neighboursSettlements.sort(byId);
  }

  // STEP 5: Settlements ↔ Tiles
  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.adjacentTiles =
      tilesByVertex.get(settlement.vertex.id) ?? [];
  }

  // STEP 6: Ports ↔ Settlements
  // NB: ports are registered in the graph under PORT ids (not coast ids)
  for (const coast of board.coasts) {
    if (!coast.port) continue;
    const entry = graph.get(coast.port.id);
    if (!entry) continue;

    const adjacent: SettlementData[] = [];

    const s1 = settlementByVertex.get(coast.edge.p1.id);
    if (s1) adjacent.push(s1);

    const s2 = settlementByVertex.get(coast.edge.p2.id);
    if (s2 && s2.id !== s1?.id) adjacent.push(s2);

    entry.connectedSettlements = adjacent;
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
