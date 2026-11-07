import type { Resources } from '@shared/game/game.types';
import {
  GameBoardGraph,
  LandType,
  BuildingType,
  BuildingsInGame,
  LAND_RESSOURCE,
  BUILD_COSTS
} from '@shared/game/gameboard.types';


export function payResources(
  Resources: Resources,
  build: BuildingType,
) {
  switch (build) {
    case 'road':
      Resources.brick -= BUILD_COSTS.road.brick;
      Resources.wood -= BUILD_COSTS.road.wood;
      break;
    case 'settlement':
      Resources.brick -= BUILD_COSTS.settlement.brick;
      Resources.wood -= BUILD_COSTS.settlement.wood;
      Resources.sheep -= BUILD_COSTS.settlement.sheep;
      Resources.wheat -= BUILD_COSTS.settlement.wheat;
      break;
    case 'city':
      Resources.wheat -= BUILD_COSTS.settlement.wheat;
      Resources.ore -= BUILD_COSTS.settlement.ore;
      break;
    default:
      break;
  }
}

export function hasEnoughResources(
  Resources: Resources,
  build: BuildingType,
): boolean {
  switch (build) {
    case 'road':
      if (Resources.brick >= BUILD_COSTS.road.brick
        && Resources.wood >= BUILD_COSTS.road.wood)
      return true;
    case 'settlement':
      if (Resources.brick >= BUILD_COSTS.settlement.brick
        && Resources.wood >= BUILD_COSTS.settlement.wood
        && Resources.sheep >= BUILD_COSTS.settlement.sheep
        && Resources.wheat >= BUILD_COSTS.settlement.wheat)
      return true;
    case 'city':
      if (Resources.wheat >= BUILD_COSTS.settlement.wheat
        && Resources.ore >= BUILD_COSTS.settlement.ore)
      return true;
    default:
      break;
  }
  return false;
}

function addResources(
  land: LandType,
  Resources: Resources,
  isCity?: boolean
): number {
  switch (land) {
    case 'desert':
      return -1;
    case 'field':
      isCity ?
      Resources.wheat += 2
      : Resources.wheat += 1;
      break;
    case 'forest':
      isCity ?
      Resources.wood += 2
      : Resources.wood += 1;
      break;
    case 'hill':
      isCity ?
      Resources.brick += 2
      : Resources.brick += 1;
      break;
    case 'mountain':
      isCity ?
      Resources.ore += 2
      : Resources.ore += 1;
      break;
    case 'pasture':
      isCity ?
      Resources.sheep += 2
      : Resources.sheep += 1;
      break;
    default:
      return 0;
  }
  return isCity ? 2 : 1;
};

export function resourcesProduction(
  buildings: BuildingsInGame,
  graph: GameBoardGraph,
  dicesSum: number,
  placementPhase: boolean
) {
  for (const [settlementId, player] of buildings) {
    const graphEntry = graph.get(settlementId);
    if (!graphEntry) {
      console.log(`👀⛔ResourcesCheck:building: doesn't exists ...`);
      return { valid: false, reason: 'unknown building' };
    }
    graphEntry.adjacentTiles.forEach((tile) => {
      let prod: number = 0;
      if (placementPhase === true)
        prod = addResources(tile.land, player.resources);
      else if (tile.value === dicesSum) {
        const settlement = player.settlementsBuilt.get(settlementId);
        if (settlement)
          prod = addResources(tile.land, player.resources, settlement.isCity);
      }
      if (prod > 0)
        console.log(`⚖️ressoucesProduction: ${player.playerId} produced ${prod} ${LAND_RESSOURCE[tile.land]}`);
      if (prod == -1)
        console.log(`⚖️ressoucesProduction: ${player.playerId} can't produce anything in the ${tile.land}`);
    });
  }
};
