import type { Ressources } from '@shared/game/game.types';
import {
  GameBoardGraph,
  LandType,
  CostType,
  BuildingsInGame,
  LAND_RESSOURCE,
} from '@shared/game/gameboard.types';

export function hasEnoughRessources(
  ressources: Ressources,
  cost: CostType
): boolean {
  switch (cost) {
    case 'road':
      if (ressources.brick >= 1
        && ressources.wood >= 1)
      return true;
    case 'settlement':
      if (ressources.brick >= 1
        && ressources.wood >= 1
        && ressources.sheep >= 1
        && ressources.hay >= 1)
      return true;
    case 'city':
      if (ressources.hay >= 2
        && ressources.rock >= 3)
      return true;
    default:
      break;
  }
  return false;
}

function addRessources(
  land: LandType,
  ressources: Ressources,
  isCity?: boolean
): number {
  switch (land) {
    case 'desert':
      return -1;
    case 'field':
      isCity ?
      ressources.hay += 2
      : ressources.hay += 1;
      break;
    case 'forest':
      isCity ?
      ressources.wood += 2
      : ressources.wood += 1;
      break;
    case 'hill':
      isCity ?
      ressources.brick += 2
      : ressources.brick += 1;
      break;
    case 'mountain':
      isCity ?
      ressources.rock += 2
      : ressources.rock += 1;
      break;
    case 'pasture':
      isCity ?
      ressources.sheep += 2
      : ressources.sheep += 1;
      break;
    default:
      return 0;
  }
  return isCity ? 2 : 1;
};

export function ressoucesProduction(
  buildings: BuildingsInGame,
  graph: GameBoardGraph,
  dicesSum: number,
  placementPhase: boolean
) {
  for (const [settlementId, player] of buildings) {
    const graphEntry = graph.get(settlementId);
    if (!graphEntry) {
      console.log(`👀⛔ressourcesCheck:building: doesn't exists ...`);
      return { valid: false, reason: 'unknown building' };
    }
    graphEntry.adjacentTiles.forEach((tile) => {
      let prod: number = 0;
      if (placementPhase === true)
        prod = addRessources(tile.land, player.ressources);
      else if (tile.value === dicesSum) {
        const settlement = player.settlementsBuilt.get(settlementId);
        if (settlement)
          prod = addRessources(tile.land, player.ressources, settlement.isCity);
      }
      if (prod > 0)
        console.log(`⚖️ressoucesProduction: ${player.playerId} produced ${prod} ${LAND_RESSOURCE[tile.land]}`);
      if (prod == -1)
        console.log(`⚖️ressoucesProduction: ${player.playerId} can't produce anything with his ${prod} ${tile.land}`);
    });
  }
};
