import type { Ressources } from '@shared/game/game.types';
import {
  GameBoardGraph,
  LandType,
  BuildingType,
  BuildingsInGame,
  LAND_RESSOURCE,
  BUILD_COSTS
} from '@shared/game/gameboard.types';


export function payRessources(
  ressources: Ressources,
  build: BuildingType,
) {
  switch (build) {
    case 'road':
      ressources.brick -= BUILD_COSTS.road.brick;
      ressources.wood -= BUILD_COSTS.road.wood;
      break;
    case 'settlement':
      ressources.brick -= BUILD_COSTS.settlement.brick;
      ressources.wood -= BUILD_COSTS.settlement.wood;
      ressources.sheep -= BUILD_COSTS.settlement.sheep;
      ressources.wheat -= BUILD_COSTS.settlement.wheat;
      break;
    case 'city':
      ressources.wheat -= BUILD_COSTS.settlement.wheat;
      ressources.ore -= BUILD_COSTS.settlement.ore;
      break;
    default:
      break;
  }
}

export function hasEnoughRessources(
  ressources: Ressources,
  build: BuildingType,
): boolean {
  switch (build) {
    case 'road':
      if (ressources.brick >= BUILD_COSTS.road.brick
        && ressources.wood >= BUILD_COSTS.road.wood)
      return true;
    case 'settlement':
      if (ressources.brick >= BUILD_COSTS.settlement.brick
        && ressources.wood >= BUILD_COSTS.settlement.wood
        && ressources.sheep >= BUILD_COSTS.settlement.sheep
        && ressources.wheat >= BUILD_COSTS.settlement.wheat)
      return true;
    case 'city':
      if (ressources.wheat >= BUILD_COSTS.settlement.wheat
        && ressources.ore >= BUILD_COSTS.settlement.ore)
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
      ressources.wheat += 2
      : ressources.wheat += 1;
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
      ressources.ore += 2
      : ressources.ore += 1;
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
        console.log(`⚖️ressoucesProduction: ${player.playerId} can't produce anything in the ${tile.land}`);
    });
  }
};
