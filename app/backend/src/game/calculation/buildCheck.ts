import {
  type GameBoard,
  type RoadData,
  type SettlementData,
  type ElementGraph,
  Faction,
} from '@shared/game/gameboard.types';

import { GameResponse } from '@shared/game/game.types';

export type BuildRequestPayload =
  | { kind: 'road'; id: string; data: RoadData }
  | { kind: 'settlement'; id: string; data: SettlementData };

/* ================================================================== *
 * UTILITAIRES D'INDEXATION
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
 * VALIDATEUR ROUTE
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

    // Blocage par adversaire
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
 * VALIDATEUR COLONIE
 * ================================================================== */

export const validateSettlementPlacement = (
  settlement: SettlementData,
  ownerFaction: Faction,
  graph: ElementGraph,
  roads: RoadData[],
  WhoStartsPhase?: boolean
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
  const roadsByVertex = indexRoadsByVertex(roads); // à passer depuis board.roads
  const adjacentRoads = roadsByVertex.get(settlement.vertex.id) ?? [];
  const hasOwnAdjacentRoad = adjacentRoads.some(
    (r) => r.hasOwner && r.faction === ownerFaction,
  );

  if (!hasOwnAdjacentRoad && WhoStartsPhase === undefined) {
    console.log(`👀⛔buildCheck:settlement: must be connected`);
    return { valid: false, reason: 'La colonie doit toucher une de vos routes' };
  }
  console.log(`👀✅buildCheck:settlement: is valid`);
  return { valid: true };
};

/* ================================================================== *
 * MAIN VALIDATION HANDLER
 * ================================================================== */

export const buildCheck = (
  payload: BuildRequestPayload,
  ownerFaction: Faction,
  board: GameBoard,
  graph: ElementGraph,
  WhoStartsPhase?: boolean
): { value: number | null, message: string, data: GameBoard | null } => {
  try {
    // Cohérence de l'ID
    if ((payload.data as { id?: unknown })?.id !== payload.id) {
      return {
        value: null,
        message: 'Incohérence entre l\'ID et les données fournies',
        data: null,
      };
    }
    const targetId = payload.id;
    switch (payload.kind) {
      case 'road': {
        const target = board.roads.find(r => r.id === targetId);
        if (!target) {
          console.log(`👀⛔buildCheck:road: invalid, element doesn't exist`);
          return {
            value: null,
            message: 'unknown road',
            data: null,
          };
        }
        const roadResult = validateRoadPlacement(
          target,
          ownerFaction,
          graph
        );
        if (!roadResult.valid) {
          return {
            value: null,
            message: roadResult.reason,
            data: null,
          };
        }
        target.faction = ownerFaction;
        target.hasOwner = true;
        return {
          value: 1,
          message: 'Route valide',
          data: board,
        };
      }

      case 'settlement': {
        const target = board.settlements.find(s => s.id === targetId);
        if (!target) {
          console.log(`👀⛔buildCheck:road: invalid, element doesn't exist`);
          return {
            value: null,
            message: 'unknown settlement',
            data: null,
          };
        }
        const settlementResult = validateSettlementPlacement(
          target,
          ownerFaction,
          graph,
          board.roads,
          WhoStartsPhase
        );
        if (!settlementResult.valid) {
          console.log(`👀⛔buildCheck:settlement: invalid, element doesn't exist`);
          return {
            value: null,
            message: settlementResult.reason,
            data: null,
          };
        }
        target.faction = ownerFaction;
        target.hasOwner = true;
        return {
          value: 4,
          message: 'Colonie valide',
          data: board,
        };
      }

      default:
        return {
          value: null,
          message: 'Type de construction inconnu',
          data: null,
        };
    }
  } catch (error) {
    return {
      value: null,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      data: null,
    };
  }
};