import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { GameData, GameResponse, Player } from '@shared/game/game.types';
import {
  type GameBoard,
  type RoadData,
  type SettlementData,
  type GameBoardGraph,
  Faction,
  Buildings,
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
  graph: GameBoardGraph,
): { valid: true } | { valid: false; reason: string } => {
 if (road.hasOwner) {
    console.log(`👀⛔buildCheck:road: already occupied`);
    return { valid: false, reason: 'road already occupied' };
  }

  const settlementsByVertex = indexSettlementsByVertex([]); // à passer depuis board.settlements
  const graphEntry = graph.get(road.id);

  if (!graphEntry) {
    console.log(`👀⛔buildCheck:road: doesn't exists ...`);
    return { valid: false, reason: 'unknown road' };
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
  graph: GameBoardGraph,
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

interface BuildValidation {
  valid: boolean,
  message: string
}

function settlementCheck(
  board: GameBoard,
  target: SettlementData,
  graph: GameBoardGraph,
  ownerFaction: Faction,
  whoStartsPhase: boolean | undefined
): BuildValidation {
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
  //target.faction = ownerFaction;
  //target.hasOwner = true;
  return {
    valid: true,
    message: 'valid settlement',
  };
}

function roadCheck(
  target: RoadData,
  graph: GameBoardGraph,
  ownerFaction: Faction
): BuildValidation{
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
  //target.faction = ownerFaction;
  //target.hasOwner = true;
  return {
    valid: true,
    message: 'valid road'
  };
}

export const buildCheck = (
  data: GameData,
  payload: BuildRequestPayload,
  player: Player,
  ownerFaction: Faction,
  board: GameBoard,
  graph: GameBoardGraph,
  buildings: Buildings,
  whoStartsPhase?: boolean
): { valid: boolean, message: string } => {
  let check: BuildValidation = { valid: false, message: ""};
  let target: RoadData | SettlementData | undefined;
  try {
    if ((payload.data as { id?: unknown })?.id !== payload.id) {
      return {
        valid: false,
        message: 'incoherent data payload id',
      };
    }
    switch (payload.kind) {
      case 'road':
        target = board.roads.find(r => r.id === payload.id);
        if (!target) break;
        check = roadCheck(target, graph, ownerFaction);
      case 'settlement':
        target = board.settlements.find(r => r.id === payload.id);
        if (!target) break;
        check = settlementCheck(board, target, graph, ownerFaction, whoStartsPhase);
      default:
        break;
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'unknown error',
    };
  }
  if (check.valid) {
    if (target) {
      target.faction = ownerFaction;
      target.hasOwner = true;
    }
    const p = data.players.get(player.playerId);
    if (!p) {
      throw new Error(`buildCheck: Unknown playerId: ${player.playerId}`);
    }
    buildings.set(payload.id, p);
    return check;
  }
  console.log(`👀⛔buildCheck: invalid, element doesn't exist`);
  return {
    valid: false,
    message: 'unknown element',
  };
};