import type { GameBoardGraph, TileData } from 'shared';
import { BuildingType, type BuildPayload } from 'shared';

/**
 * Randomizes the settlement placement for a player (AFK / auto-play).
 * 1. Filters the core elements to keep only settlements,
 * 2. picks one at random from that selection,
 * 3. returns it wrapped in the build payload.
 *
 * @returns the payload, or null if there is no settlement to pick.
 */
export function randomizeFirstSettlement(
  graph: GameBoardGraph,
): BuildPayload | null {
  const settlements = [...graph.values()].filter(
    (elements) =>
      elements.core.type === BuildingType.SETTLEMENT &&
      elements.core.data.ownerId === null,
  );
  if (settlements.length === 0) return null;
  const picked = settlements[Math.floor(Math.random() * settlements.length)];
  if (picked.core.type === BuildingType.SETTLEMENT) {
    return {
      kind: BuildingType.SETTLEMENT,
      id: picked.core.data.id,
      data: picked.core.data,
    };
  }
  return null;
}

export function randomizeRobber(tiles: TileData[]) {
  const oldTile = tiles.find((tile) => tile.hasRobber);

  const candidates = tiles.filter((tile) => tile !== oldTile);
  if (candidates.length === 0) return;

  const newTile = candidates[Math.floor(Math.random() * candidates.length)];

  if (oldTile) oldTile.hasRobber = false;
  newTile.hasRobber = true;
}
