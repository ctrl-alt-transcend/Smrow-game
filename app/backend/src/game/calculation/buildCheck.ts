import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { GameResponse } from '@shared/game/game.types';
import {
  type GameBoard,
  type RoadData,
  type SettlementData,
  type ElementGraph,
  Faction,
} from '@shared/game/gameboard.types';

export type BuildRequestPayload =
  | { kind: 'road'; id: string; data: RoadData }
  | { kind: 'settlement'; id: string; data: SettlementData };

/* ================================================================== *
 * INDEX UTILS
 * ================================================================== */
const indexSettlementsByVertex = (
  settlements: SettlementData[],
): Map<string, SettlementData> => {
  const map = new Map<string, SettlementData>();
  for (const s of settlements) {
    map.set(s.vertex.id, s);
  }
  return map;
};

const indexRoadsByVertex = (
  roads: RoadData[],
): Map<string, RoadData[]> => {
  const map = new Map<string, RoadData[]>();
  for (const road of roads) {
    for (const vertexId of [road.edge.p1.id, road.edge.p2.id]) {
      const bucket = map.get(vertexId);
      if (bucket) bucket.push(road);
      else map.set(vertexId, [road]);
    }
  }
  return map;
};


/* ================================================================== *
 * ROAD VALIDATION
 * ================================================================== */
export const validateRoadPlacement = (
  road: RoadData,
  ownerFaction: Faction,
  graph: ElementGraph,
): { valid: true } | { valid: false; reason: string } => {
 if (road.hasOwner) {
    console.log(`👀⛔buildCheck:road: already occupied`);
    return { valid: false, reason: 'Cette route est déjà occupée' };
  }

  const settlementsByVertex = indexSettlementsByVertex([]); // à passer depuis board.settlements
  const graphEntry = graph.get(road.id);

  if (!graphEntry) {
    console.log(`👀⛔buildCheck:road: doesn't exists ...`);
    return { valid: false, reason: 'Route introuvable dans le graphe' };
  }
  const endpoints = [road.edge.p1.id, road.edge.p2.id];
  let connectedToNetwork = false;

  for (const vertexId of endpoints) {
    const settlement = settlementsByVertex.get(vertexId);
    if (settlement?.hasOwner && settlement.faction !== ownerFaction) {
      console.log(`👀⛔buildCheck:road: blocked by opponent`);
      continue;
    }

    // Connexion directe à son propre bâtiment
    if (settlement?.hasOwner && settlement.faction === ownerFaction) {
      connectedToNetwork = true;
      break;
    }

    // Connexion via une de ses routes voisines (lu depuis le graph)
    const hasConnectionViaNeighbor = graphEntry.connectedRoads.some(
      (neighbor) =>
        neighbor.hasOwner &&
        neighbor.faction === ownerFaction &&
        (neighbor.edge.p1.id === vertexId || neighbor.edge.p2.id === vertexId),
    );

    if (hasConnectionViaNeighbor) {
      connectedToNetwork = true;
      break;
    }
  }

  const hasOwnAdjacentSettlement = graphEntry.adjacentSettlements.some(
    s => s.hasOwner && s.faction === ownerFaction
  );
  if (!hasOwnAdjacentSettlement) {
    if (connectedToNetwork) {
      console.log(`👀✅buildCheck:road: is valid`);
      return { valid: true };
    }
  }
  if (!connectedToNetwork && !hasOwnAdjacentSettlement) {
    console.log(`👀⛔buildCheck:road: must be connected to network`);
    return { valid: false, reason: 'La route doit être connectée à votre réseau' };
  }
  console.log(`👀✅buildCheck:road: is valid`);
  return { valid: true };
};

/* ================================================================== *
 * SETTLEMENT VALIDATION
 * ================================================================== */
export const validateSettlementPlacement = (
  settlement: SettlementData,
  ownerFaction: Faction,
  graph: ElementGraph,
  roads: RoadData[],
  whoStartsPhase?: boolean
): { valid: true } | { valid: false; reason: string } => {
  if (settlement.hasOwner) {
    console.log(`👀⛔buildCheck:settlement: already occupied`);
    return { valid: false, reason: 'Cette colonie est déjà occupée' };
  }

  const graphEntry = graph.get(settlement.id);

  if (!graphEntry) {
    console.log(`👀⛔buildCheck:settlement: doesn't exists ...`);
    return { valid: false, reason: 'Colonne introuvable dans le graphe' };
  }

  // Règle de distance : aucun sommet adjacent occupé (lu depuis le graph)
  const nearbyOccupied = graphEntry.connectedSettlements.some((s) => s.hasOwner);
  if (nearbyOccupied) {
    console.log(`👀⛔buildCheck:settlement: too close to another one`);
    return { valid: false, reason: 'Colonie trop proche d\'une construction existante' };
  }

  // Doit toucher une de ses propres routes
  const roadsByVertex = indexRoadsByVertex(roads);
  const adjacentRoads = roadsByVertex.get(settlement.vertex.id) ?? [];
  const hasOwnAdjacentRoad = adjacentRoads.some(
    (r) => r.hasOwner && r.faction === ownerFaction,
  );

  if (!hasOwnAdjacentRoad && whoStartsPhase === undefined) {
    console.log(`👀⛔buildCheck:settlement: must be connected`);
    return { valid: false, reason: 'La colonie doit toucher une de vos routes' };
  }
  console.log(`👀✅buildCheck:settlement: is valid`);
  return { valid: true };
};

function settlementCheck(
  board: GameBoard,
  target: SettlementData,
  graph: ElementGraph,
  ownerFaction: Faction,
  whoStartsPhase: boolean | undefined
): {
  valid: boolean,
  message: string,
} {

  const settlementResult = validateSettlementPlacement(
    target,
    ownerFaction,
    graph,
    board.roads,
    whoStartsPhase
  );
  if (!settlementResult.valid) {
    console.log(`👀⛔buildCheck:settlement: invalid, element doesn't exist`);
    return {
      valid: false,
      message: settlementResult.reason,
    };
  }
  target.faction = ownerFaction;
  target.hasOwner = true;
  return {
    valid: true,
    message: 'valid settlement',
  };
}

function roadCheck( board: GameBoard, target: RoadData, graph: ElementGraph, ownerFaction: Faction ): {
  valid: boolean,
  message: string
} {
  const roadResult = validateRoadPlacement(
    target,
    ownerFaction,
    graph
  );
  if (!roadResult.valid) {
    return {
      valid: false,
      message: roadResult.reason,
    };
  }
  target.faction = ownerFaction;
  target.hasOwner = true;
  return {
    valid: true,
    message: 'valid road'
  };
}

export const buildCheck = (
  payload: BuildRequestPayload,
  ownerFaction: Faction,
  board: GameBoard,
  graph: ElementGraph,
  whoStartsPhase?: boolean
): { valid: boolean, message: string } => {
  try {
    if ((payload.data as { id?: unknown })?.id !== payload.id) {
      return {
        valid: false,
        message: 'incoherent data payload id',
      };
    }
    let target: RoadData | SettlementData | undefined;
    switch (payload.kind) {
      case 'road':
        target = board.roads.find(r => r.id === payload.id);
        if (!target) break;
        return roadCheck(board, target, graph, ownerFaction);
      case 'settlement':
        target = board.settlements.find(r => r.id === payload.id);
        if (!target) break;
        return settlementCheck(board, target, graph, ownerFaction, whoStartsPhase);
      default:
        break;
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'unknown error',
    };
  }
  console.log(`👀⛔buildCheck: invalid, element doesn't exist`);
  return {
    valid: false,
    message: 'unknown element',
  };
};