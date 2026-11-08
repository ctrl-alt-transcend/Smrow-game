import { Player } from "@shared/game/game.types";
import { RessourceType, TileData } from "@shared/game/gameboard.types";
import { randomizeRobber } from "./randomizeGameBoard";

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
export function robberRule(players: Map<string, Player>, tiles: TileData[]): void {
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
    const pool: RessourceType[] = [];
    for (const [resource, count] of Object.entries(player.resources)) {
      for (let i = 0; i < count; i++) pool.push(resource as RessourceType);
    }
    for (let i = 0; i < toDiscard; i++) {
      const pickIndex = Math.floor(Math.random() * pool.length);
      const picked = pool.splice(pickIndex, 1)[0];
      if (player.resources[picked] >= 1)
        player.resources[picked] -= 1;
    }
  });
  randomizeRobber(tiles);
}
