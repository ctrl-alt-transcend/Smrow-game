import type { Resources, TradeForm } from 'shared';
import { LandType, BuildingType, BUILD_COSTS } from 'shared';

export function earnTradeResources(resources: Resources, target: TradeForm) {
  switch (target.resource) {
    case 'wood':
      resources.wood += target.amount;
      break;
    case 'sheep':
      resources.sheep += target.amount;
      break;
    case 'brick':
      resources.brick += target.amount;
      break;
    case 'ore':
      resources.ore += target.amount;
      break;
    case 'wheat':
      resources.wheat += target.amount;
      break;
    default:
      break;
  }
}

export function payTradeResources(resources: Resources, offer: TradeForm) {
  switch (offer.resource) {
    case 'wood':
      resources.wood -= offer.amount;
      break;
    case 'sheep':
      resources.sheep -= offer.amount;
      break;
    case 'brick':
      resources.brick -= offer.amount;
      break;
    case 'ore':
      resources.ore -= offer.amount;
      break;
    case 'wheat':
      resources.wheat -= offer.amount;
      break;
    default:
      break;
  }
}

export function hasEnoughResourcesToTrade(
  resources: Resources,
  offer: TradeForm,
): boolean {
  switch (offer.resource) {
    case 'wood':
      if (resources.wood >= offer.amount) return true;
      break;
    case 'sheep':
      if (resources.sheep >= offer.amount) return true;
      break;
    case 'brick':
      if (resources.brick >= offer.amount) return true;
      break;
    case 'ore':
      if (resources.ore >= offer.amount) return true;
      break;
    case 'wheat':
      if (resources.wheat >= offer.amount) return true;
      break;
    default:
      break;
  }
  return false;
}

export function payBuildResources(resources: Resources, build: BuildingType) {
  switch (build) {
    case 'road':
      resources.brick -= BUILD_COSTS.road.brick;
      resources.wood -= BUILD_COSTS.road.wood;
      break;
    case 'settlement':
      resources.brick -= BUILD_COSTS.settlement.brick;
      resources.wood -= BUILD_COSTS.settlement.wood;
      resources.sheep -= BUILD_COSTS.settlement.sheep;
      resources.wheat -= BUILD_COSTS.settlement.wheat;
      break;
    case 'city':
      resources.wheat -= BUILD_COSTS.city.wheat;
      resources.ore -= BUILD_COSTS.city.ore;
      break;
    default:
      break;
  }
}

export function hasEnoughResourcesToBuild(
  resources: Resources,
  build: BuildingType,
): boolean {
  switch (build) {
    case 'road':
      if (
        resources.brick >= BUILD_COSTS.road.brick &&
        resources.wood >= BUILD_COSTS.road.wood
      )
        return true;
      break;
    case 'settlement':
      if (
        resources.brick >= BUILD_COSTS.settlement.brick &&
        resources.wood >= BUILD_COSTS.settlement.wood &&
        resources.sheep >= BUILD_COSTS.settlement.sheep &&
        resources.wheat >= BUILD_COSTS.settlement.wheat
      )
        return true;
      break;
    case 'city':
      if (
        resources.wheat >= BUILD_COSTS.city.wheat &&
        resources.ore >= BUILD_COSTS.city.ore
      )
        return true;
      break;
    default:
      break;
  }
  return false;
}

function addResource(resource: number, isCity?: boolean) {
  if (isCity) {
    resource += 2;
  } else {
    resource += 1;
  }
}

export function produceResources(
  land: LandType,
  resources: Resources,
  isCity?: boolean,
): number {
  switch (land) {
    case 'desert': {
      return 0;
    }
    case 'field':
      addResource(resources.wheat, isCity);
      break;
    case 'forest':
      addResource(resources.wood, isCity);
      break;
    case 'hill':
      addResource(resources.brick, isCity);
      break;
    case 'mountain':
      addResource(resources.ore, isCity);
      break;
    case 'pasture':
      addResource(resources.sheep, isCity);
      break;
    default:
      return 0;
  }
  return isCity ? 2 : 1;
}
