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
    return { valid: false, reason: 'Cette route est déjà occupée' };
  }

  const settlementsByVertex = indexSettlementsByVertex([]); // à passer depuis board.settlements
  const graphEntry = graph.get(road.id);

  if (!graphEntry) {
    return { valid: false, reason: 'Route introuvable dans le graphe' };
  }

  const endpoints = [road.edge.p1.id, road.edge.p2.id];
  let connectedToNetwork = false;

  for (const vertexId of endpoints) {
    const settlement = settlementsByVertex.get(vertexId);

    // Blocage par adversaire
    if (settlement?.hasOwner && settlement.faction !== ownerFaction) {
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

  if (!connectedToNetwork) {
    return { valid: false, reason: 'La route doit être connectée à votre réseau' };
  }

  return { valid: true };
};

/* ================================================================== *
 * VALIDATEUR COLONIE
 * ================================================================== */

export const validateSettlementPlacement = (
  settlement: SettlementData,
  ownerFaction: Faction,
  graph: ElementGraph,
): { valid: true } | { valid: false; reason: string } => {
  if (settlement.hasOwner) {
    return { valid: false, reason: 'Cette colonie est déjà occupée' };
  }

  const graphEntry = graph.get(settlement.id);

  if (!graphEntry) {
    return { valid: false, reason: 'Colonne introuvable dans le graphe' };
  }

  // Règle de distance : aucun sommet adjacent occupé (lu depuis le graph)
  const nearbyOccupied = graphEntry.connectedSettlements.some((s) => s.hasOwner);
  if (nearbyOccupied) {
    return { valid: false, reason: 'Colonie trop proche d\'une construction existante' };
  }

  // Doit toucher une de ses propres routes
  const roadsByVertex = indexRoadsByVertex([]); // à passer depuis board.roads
  const adjacentRoads = roadsByVertex.get(settlement.vertex.id) ?? [];
  const hasOwnAdjacentRoad = adjacentRoads.some(
    (r) => r.hasOwner && r.faction === ownerFaction,
  );

  if (!hasOwnAdjacentRoad) {
    return { valid: false, reason: 'La colonie doit toucher une de vos routes' };
  }

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

    switch (payload.kind) {
      case 'road': {
        const roadResult = validateRoadPlacement(payload.data, ownerFaction, graph);
        if (!roadResult.valid) {
          return {
            value: null,
            message: roadResult.reason,
            data: null,
          };
        }
        return {
          value: 1,
          message: 'Route valide',
          data: board,
        };
      }

      case 'settlement': {
        const settlementResult = validateSettlementPlacement(
          payload.data,
          ownerFaction,
          graph,
        );
        if (!settlementResult.valid) {
          return {
            value: null,
            message: settlementResult.reason,
            data: null,
          };
        }
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