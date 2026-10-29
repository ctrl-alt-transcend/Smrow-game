import {
  type Vertex,
  type Edge,
  type TileData,
  type RoadData,
  type SettlementData,
  type GameBoard,
  type ConnectedElements,
  type ElementGraph,
  Faction,
} from "../../../../shared/game/gameboard.types";
import { getHexCorners, getHexEdges, HEX_SIZE } from "@shared/game/hexCalculation";

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

  const settlements: SettlementData[] = Array.from(allVertices.values(), (v) => ({
    id: v.id,
    vertex: v,
    faction: Faction.UNOCCUPIED,
    hasOwner: false,
  }));

  const roads: RoadData[] = Array.from(allEdges.values(), (e) => ({
    id: e.id,
    edge: e,
    faction: Faction.UNOCCUPIED,
    hasOwner: false,
  }));

  // --- SVG calculation ---
  const margin = 50;
  const bounds = Array.from(allVertices.values()).reduce(
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
    svgBounds: { svgWidth, svgHeight, offsetX, offsetY },
  };
};

const emptyConnections = (): ConnectedElements => ({
  connectedRoads: [],
  connectedSettlements: [],
  adjacentTiles: [],
  adjacentSettlements: []
});

/** @description réserve une entrée dans le graphe et détecte les collisions d'id */
const register = (graph: ElementGraph, id: string): ConnectedElements => {
  if (graph.has(id)) {
    throw new Error(`[linkGameBoard] id dupliqué dans le plateau : "${id}"`);
  }
  const entry = emptyConnections();
  graph.set(id, entry);
  return entry;
};

/** @description vertexId → routes touchant ce sommet (2 entrées par route) */
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

/** @description vertexId → tiles for which this vertex is a corner (6 entries per tile) */
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
* @description Constructs the adjacency graph from the board.
* Returns an independent Map: it is NEVER linked to `board`,
* otherwise the board becomes cyclic again and causes socket.io to crash.
*/
export const linkGameBoard = (board: GameBoard): ElementGraph => {
  const graph: ElementGraph = new Map();

  // 1. one empty entry per element
  for (const road of board.roads) register(graph, road.id);
  for (const settlement of board.settlements) register(graph, settlement.id);

  // 2. roads ↔ roads (share at least one vertex, ≤ 4)
  const roadsByVertex = indexRoadsByVertex(board.roads);

  for (const road of board.roads) {
    const neighbours = new Map<string, RoadData>();

    for (const vertexId of [road.edge.p1.id, road.edge.p2.id]) {
      for (const candidate of roadsByVertex.get(vertexId) ?? []) {
        if (candidate.id !== road.id) neighbours.set(candidate.id, candidate);
      }
    }

    graph.get(road.id)!.connectedRoads = [...neighbours.values()].sort(byId);
  }

  // 3. colonies ↔ colonies (connected by an edge, ≤ 3)
  const settlementByVertex = new Map<string, SettlementData>(
    board.settlements.map((s) => [s.vertex.id, s]),
  );

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

  // 4. colonies ↔ tiles (3 on the inside, 1–2 on the edge)
  const tilesByVertex = indexTilesByVertex(board.layout);

  for (const settlement of board.settlements) {
    graph.get(settlement.id)!.adjacentTiles =
      tilesByVertex.get(settlement.vertex.id) ?? [];
  }

  return graph;
};

export interface LinkedGameBoard {
  board: GameBoard;
  graph: ElementGraph;
}

export const createGameBoard = (tiles: TileData[]): LinkedGameBoard => {
  const board = initGameBoard(tiles);
  return { board, graph: linkGameBoard(board) };
};

export const getConnections = (
  graph: ElementGraph,
  elementId: string,
): ConnectedElements | undefined => graph.get(elementId);
