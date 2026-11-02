import type { Player } from '@shared/game/game.types';
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

const indexRoadsByVertex = (roads: RoadData[]): Map<string, RoadData[]> => {
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
    //console.log(`👀⛔buildCheck:road: already occupied`);
    return { valid: false, reason: 'road already occupied' };
  }

  const settlementsByVertex = indexSettlementsByVertex([]);
  const graphEntry = graph.get(road.id);

  if (!graphEntry) {
    //console.log(`👀⛔buildCheck:road: doesn't exists ...`);
    return { valid: false, reason: 'unknown road' };
  }
  const endpoints = [road.edge.p1.id, road.edge.p2.id];
  let connectedToNetwork = false;

  for (const vertexId of endpoints) {
    const settlement = settlementsByVertex.get(vertexId);
    if (settlement?.hasOwner && settlement.faction !== ownerFaction) {
      //console.log(`👀⛔buildCheck:road: blocked by opponent`);
      continue;
    }

    if (settlement?.hasOwner && settlement.faction === ownerFaction) {
      connectedToNetwork = true;
      break;
    }

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
    (s) => s.hasOwner && s.faction === ownerFaction,
  );
  if (!hasOwnAdjacentSettlement) {
    if (connectedToNetwork) {
      //console.log(`👀✅buildCheck:road: is valid`);
      return { valid: true };
    }
  }
  if (!connectedToNetwork && !hasOwnAdjacentSettlement) {
    //console.log(`👀⛔buildCheck:road: must be connected to network`);
    return {
      valid: false,
      reason: 'road must be connected to network',
    };
  }
  //console.log(`👀✅buildCheck:road: is valid`);
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
  placementPhase?: boolean,
): { valid: true } | { valid: false; reason: string } => {
  if (settlement.hasOwner) {
    //console.log(`👀⛔buildCheck:settlement: already occupied`);
    return { valid: false, reason: 'settlement already owned by another player' };
  }

  const graphEntry = graph.get(settlement.id);

  if (!graphEntry) {
    //console.log(`👀⛔buildCheck:settlement: doesn't exists ...`);
    return { valid: false, reason: 'unknown settlement' };
  }

  // Règle de distance : aucun sommet adjacent occupé (lu depuis le graph)
  const nearbyOccupied = graphEntry.connectedSettlements.some(
    (s) => s.hasOwner,
  );
  if (nearbyOccupied) {
    //console.log(`👀⛔buildCheck:settlement: too close to another one`);
    return {
      valid: false,
      reason: "settlement too close to another one",
    };
  }

  // Doit toucher une de ses propres routes
  const roadsByVertex = indexRoadsByVertex(roads);
  const adjacentRoads = roadsByVertex.get(settlement.vertex.id) ?? [];
  const hasOwnAdjacentRoad = adjacentRoads.some(
    (r) => r.hasOwner && r.faction === ownerFaction,
  );

  if (!hasOwnAdjacentRoad && placementPhase === undefined) {
    //console.log(`👀⛔buildCheck:settlement: must be connected`);
    return {
      valid: false,
      reason: 'settlement must be connected to a road',
    };
  }
  //console.log(`👀✅buildCheck:settlement: is valid`);
  return { valid: true };
};

interface BuildValidation {
  valid: boolean;
  message: string;
}

function settlementCheck(
  board: GameBoard,
  target: SettlementData,
  graph: GameBoardGraph,
  player: Player,
  placementPhase?: boolean,
): BuildValidation {
  const settlementResult = validateSettlementPlacement(
    target,
    player.faction,
    graph,
    board.roads,
    placementPhase,
  );
  if (
    !placementPhase &&
    player.ressources.brick < 1 &&
    player.ressources.wood < 1 &&
    player.ressources.sheep < 1 &&
    player.ressources.hay < 1
  ) {
    //console.log(`👀⛔buildCheck:settlement: not enough ressources`);
    return {
      valid: false,
      message: 'not enough ressources',
    };
  }
  if (!settlementResult.valid) {
    //console.log(`👀⛔buildCheck:settlement: invalid, element doesn't exist`);
    return {
      valid: false,
      message: settlementResult.reason,
    };
  }
  target.faction = player.faction;
  target.hasOwner = true;
  if (!placementPhase) {
    player.ressources.brick--;
    player.ressources.wood--;
    player.ressources.sheep--;
    player.ressources.hay--;
  }
  return {
    valid: true,
    message: 'valid settlement',
  };
}

function roadCheck(
  target: RoadData,
  graph: GameBoardGraph,
  player: Player,
  placementPhase?: boolean,
): BuildValidation {
  const roadResult = validateRoadPlacement(target, player.faction, graph);
  if (
    !placementPhase &&
    player.ressources.brick < 1 &&
    player.ressources.wood < 1
  ) {
    //console.log(`👀⛔buildCheck:road: not enough ressources`);
    return {
      valid: false,
      message: 'not enough ressources',
    };
  }
  if (!roadResult.valid) {
    return {
      valid: false,
      message: roadResult.reason,
    };
  }
  target.faction = player.faction;
  target.hasOwner = true;
  if (!placementPhase) {
    player.ressources.brick--;
    player.ressources.wood--;
  }
  return {
    valid: true,
    message: 'valid road',
  };
}

export const buildCheck = (
  payload: BuildRequestPayload,
  player: Player,
  board: GameBoard,
  graph: GameBoardGraph,
  buildings: Buildings,
  placementPhase?: boolean,
): { valid: boolean; message: string } => {
  let check: BuildValidation = { valid: false, message: '' };
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
        target = board.roads.find((r) => r.id === payload.id);
        if (!target) break;
        check = roadCheck(target, graph, player, placementPhase);
        if (check.valid) player.roadsBuilt++;
        break;
      case 'settlement':
        target = board.settlements.find((r) => r.id === payload.id);
        if (!target) break;
        check = settlementCheck(board, target, graph, player, placementPhase);
        if (check.valid) player.settlementsBuilt++;
        break;
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
    buildings.set(payload.id, player);
    return check;
  }
  return {
    valid: false,
    message: 'invalid element',
  };
};
