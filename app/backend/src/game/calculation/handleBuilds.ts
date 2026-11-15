import {
  type GameBoard,
  type RoadData,
  type SettlementData,
  type GameBoardGraph,
  type Player,
  type BuildPayload,
  Faction,
  BuildingsInGame,
  SETTLEMENT_POINT,
  CITY_POINT,
} from 'shared';
import {
  hasEnoughResourcesToBuild,
  payBuildResources,
} from './handleResources';
import { crossroadRule } from './handleGameRules';

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
  if (road.ownerId) {
    return { valid: false, reason: 'Road already owned by a player !' };
  }

  const settlementsByVertex = indexSettlementsByVertex([]);
  const graphEntry = graph.get(road.id);

  if (!graphEntry) {
    return { valid: false, reason: 'Unknown road ...' };
  }
  const endpoints = [road.edge.p1.id, road.edge.p2.id];
  let connectedToNetwork = false;

  for (const vertexId of endpoints) {
    const settlement = settlementsByVertex.get(vertexId);
    if (settlement?.ownerId && settlement.faction !== ownerFaction) {
      continue;
    }

    if (settlement?.ownerId && settlement.faction === ownerFaction) {
      connectedToNetwork = true;
      break;
    }

    const hasConnectionViaNeighbor = graphEntry.connectedRoads.some(
      (neighbor) =>
        neighbor.ownerId &&
        neighbor.faction === ownerFaction &&
        (neighbor.edge.p1.id === vertexId || neighbor.edge.p2.id === vertexId),
    );

    if (hasConnectionViaNeighbor) {
      connectedToNetwork = true;
      break;
    }
  }

  const hasOwnAdjacentSettlement = graphEntry.connectedSettlements.some(
    (s) => s.ownerId && s.faction === ownerFaction,
  );
  if (!hasOwnAdjacentSettlement) {
    if (connectedToNetwork) {
      return { valid: true };
    }
  }
  if (!connectedToNetwork && !hasOwnAdjacentSettlement) {
    return {
      valid: false,
      reason: 'A road must be connected to your network ...',
    };
  }
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
  if (settlement.ownerId) {
    return {
      valid: false,
      reason: 'This settlement is already owned by a player !',
    };
  }

  const graphEntry = graph.get(settlement.id);

  if (!graphEntry) {
    return { valid: false, reason: 'Unknown settlement ...' };
  }

  const nearbyOccupied = graphEntry.neighboursSettlements.some(
    (s) => s.ownerId,
  );
  if (nearbyOccupied) {
    return {
      valid: false,
      reason: 'Another settlement is too close !',
    };
  }

  const roadsByVertex = indexRoadsByVertex(roads);
  const adjacentRoads = roadsByVertex.get(settlement.vertex.id) ?? [];
  const hasOwnAdjacentRoad = adjacentRoads.some(
    (r) => r.ownerId && r.faction === ownerFaction,
  );

  if (!hasOwnAdjacentRoad && placementPhase === undefined) {
    return {
      valid: false,
      reason: 'A settlement must be connected to a road !',
    };
  }
  return { valid: true };
};

interface BuildValidation {
  valid: boolean;
  message: string;
}

function cityUpgradeCheck(
  target: SettlementData,
  player: Player,
): BuildValidation {
  if (target.isCity) {
    return {
      valid: false,
      message: "Can't upgrade more, it's already a city !",
    };
  } else if (!hasEnoughResourcesToBuild(player.resources, 'city')) {
    return {
      valid: false,
      message:
        "You don't have enough resources to upgrade your settlement to a city ...",
    };
  }
  player.victoryPoints += CITY_POINT;
  target.isCity = true;
  payBuildResources(player.resources, 'city');
  return {
    valid: true,
    message: 'Settlement upgraded to a city !',
  };
}

function settlementCheck(
  board: GameBoard,
  target: SettlementData,
  graph: GameBoardGraph,
  player: Player,
  placementPhase?: boolean,
): BuildValidation {
  if (
    !placementPhase &&
    !hasEnoughResourcesToBuild(player.resources, 'settlement')
  ) {
    return {
      valid: false,
      message: "You don't have enough resources to build a settlement ...",
    };
  }

  const settlementResult = validateSettlementPlacement(
    target,
    player.faction,
    graph,
    board.roads,
    placementPhase,
  );

  if (!settlementResult.valid) {
    return {
      valid: false,
      message: settlementResult.reason,
    };
  }
  player.victoryPoints += SETTLEMENT_POINT;
  target.faction = player.faction;
  target.ownerId = player.playerId;
  if (!placementPhase) {
    payBuildResources(player.resources, 'settlement');
  }
  return {
    valid: true,
    message: 'Settlement built !',
  };
}

function roadCheck(
  target: RoadData,
  graph: GameBoardGraph,
  player: Player,
  placementPhase?: boolean,
): BuildValidation {
  if (!placementPhase && !hasEnoughResourcesToBuild(player.resources, 'road')) {
    return {
      valid: false,
      message: "You don't have enough resources to build a road ...",
    };
  }

  const roadResult = validateRoadPlacement(target, player.faction, graph);

  if (!roadResult.valid) {
    return {
      valid: false,
      message: roadResult.reason,
    };
  }
  target.faction = player.faction;
  target.ownerId = player.playerId;
  if (!placementPhase) {
    payBuildResources(player.resources, 'road');
  }
  return {
    valid: true,
    message: 'Road built !',
  };
}

export const buildCheck = (
  payload: BuildPayload,
  player: Player,
  board: GameBoard,
  graph: GameBoardGraph,
  buildings: BuildingsInGame,
  placementPhase?: boolean,
): { valid: boolean; message: string } => {
  let check: BuildValidation = { valid: false, message: '' };
  try {
    let target: RoadData | SettlementData | undefined;
    switch (payload.kind) {
      case 'road':
        target = board.roads.find((r) => r.id === payload.id);
        if (!target) break;
        check = roadCheck(target, graph, player, placementPhase);
        if (check.valid) {
          player.roadsBuilt++;
          if (crossroadRule(target, graph)) {
            player.victoryPoints++;
            return {
              valid: true,
              message:
                "Road built and 'Crossroad' objective achieved, you earn one bonus victory point!",
            };
          }
        }
        break;
      case 'settlement':
        target = board.settlements.find((r) => r.id === payload.id);
        if (!target) break;
        if (!target.ownerId) {
          check = settlementCheck(board, target, graph, player, placementPhase);
          if (check.valid) player.settlementsBuilt.set(target.id, target);
        } else if (target.ownerId == player.playerId) {
          check = cityUpgradeCheck(target, player);
        } else {
          check.message = 'This settlement is owned by another player.';
        }
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
  if (check.valid && !buildings.has(payload.id)) {
    buildings.set(payload.id, player);
  }
  return check;
};
