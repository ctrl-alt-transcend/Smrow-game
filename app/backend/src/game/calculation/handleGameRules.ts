import {
  CROSSROADS_RULE,
  type GameBoardGraph,
  Player,
  ResourceType,
  RoadData,
  TileData,
} from 'shared';
import { randomizeRobber } from './randomizeGameBoard';

/**
 * Applies the robber rule when it is moved to a new tile:
 * 1. Every player holding MORE than 7 resources (all combined) loses half
 *    of them, rounded in the player's favor (e.g. 9 → lose 4).
 * 2. The discarded resources are picked randomly.
 * 3. The robber leaves its current tile and lands on a new one.
 *
 * NB: the resource loss applies to ALL players, including the one moving
 * the robber — that's the classic Catan rule.
 */
export function robberRule(
  players: Map<string, Player>,
  tiles: TileData[],
): void {
  const DISCARD_THRESHOLD = 7;

  players.forEach((player) => {
    const totalCount = Object.values(player.resources).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalCount <= DISCARD_THRESHOLD) return;

    const toDiscard = Math.floor(totalCount / 2);

    // Flatten the player's resources into a list of resource keys,
    // then remove randomly from it.
    const pool: ResourceType[] = [];
    for (const [resource, count] of Object.entries(player.resources)) {
      for (let i = 0; i < count; i++) pool.push(resource as ResourceType);
    }
    let remaining = toDiscard;
    while (remaining > 0 && pool.length > 0) {
      const pickIndex = Math.floor(Math.random() * pool.length);
      const picked: ResourceType = pool.splice(pickIndex, 1)[0];
      if (picked === undefined) break;
      if (player.resources[picked] >= 1) {
        player.resources[picked] -= 1;
        remaining--;
      }
    }
  });
  randomizeRobber(tiles);
}

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
