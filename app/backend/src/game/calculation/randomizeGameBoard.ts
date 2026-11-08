import { TileData } from "@shared/game/gameboard.types";

export function randomizeRobber(tiles: TileData[]) {
  const oldTile = tiles.find((tile) => tile.hasRobber);

  const candidates = tiles.filter(
    (tile) => tile !== oldTile
  );
  if (candidates.length === 0) return;

  const newTile = candidates[Math.floor(Math.random() * candidates.length)];

  if (oldTile) oldTile.hasRobber = false;
  newTile.hasRobber = true;
}
