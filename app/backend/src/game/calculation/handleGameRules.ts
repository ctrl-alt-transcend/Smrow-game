import { CROSSROADS_RULE, type GameBoardGraph, RoadData } from 'shared';

/**
 * Cross Roads custom rule: a settlement surrounded by 3 owned roads
 * earns 1 victory point (awarded once, thanks to isCrossroad).
 * Called after a road is built — checks both endpoints of the new road.
 */
export function crossroadRule(road: RoadData, graph: GameBoardGraph): boolean {
  for (const vertexId of [road.edge.p1.id, road.edge.p2.id]) {
    const entry = graph.get(vertexId);
    const settlement = entry?.core;
    if (
      settlement?.type !== 'settlement' ||
      settlement.data.ownerId !== road.ownerId ||
      settlement.data.isCrossroad
    ) {
      continue;
    }
    const ownedRoads = entry!.connectedRoads.filter(
      (r) => r.ownerId === road.ownerId,
    ).length;
    if (ownedRoads == CROSSROADS_RULE) {
      settlement.data.isCrossroad = true;
      return true;
    }
  }
  return false;
}
