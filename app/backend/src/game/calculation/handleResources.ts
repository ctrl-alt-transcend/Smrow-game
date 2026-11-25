import type { MagicDiceEffect, Resources, TradeForm } from 'shared';
import { LandType, BuildingType, BUILD_COSTS, ResourceType } from 'shared';

export function addStartingResources(resources: Resources) {
  resources.brick += BUILD_COSTS.Road.brick;
  resources.wood += BUILD_COSTS.Road.wood;
}

export function earnTradeResources(resources: Resources, target: TradeForm) {
  switch (target.resource) {
    case ResourceType.WOOD:
      resources.wood += target.amount;
      break;
    case ResourceType.SHEEP:
      resources.sheep += target.amount;
      break;
    case ResourceType.BRICK:
      resources.brick += target.amount;
      break;
    case ResourceType.ORE:
      resources.ore += target.amount;
      break;
    case ResourceType.WHEAT:
      resources.wheat += target.amount;
      break;
    default:
      break;
  }
}

export function payTradeResources(resources: Resources, offer: TradeForm) {
  switch (offer.resource) {
    case ResourceType.WOOD:
      resources.wood -= offer.amount;
      break;
    case ResourceType.SHEEP:
      resources.sheep -= offer.amount;
      break;
    case ResourceType.BRICK:
      resources.brick -= offer.amount;
      break;
    case ResourceType.ORE:
      resources.ore -= offer.amount;
      break;
    case ResourceType.WHEAT:
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
    case ResourceType.WOOD:
      if (resources.wood >= offer.amount) return true;
      break;
    case ResourceType.SHEEP:
      if (resources.sheep >= offer.amount) return true;
      break;
    case ResourceType.BRICK:
      if (resources.brick >= offer.amount) return true;
      break;
    case ResourceType.ORE:
      if (resources.ore >= offer.amount) return true;
      break;
    case ResourceType.WHEAT:
      if (resources.wheat >= offer.amount) return true;
      break;
    default:
      break;
  }
  return false;
}

export function payBuildResources(resources: Resources, build: BuildingType) {
  switch (build) {
    case BuildingType.ROAD:
      resources.brick -= BUILD_COSTS.Road.brick;
      resources.wood -= BUILD_COSTS.Road.wood;
      break;
    case BuildingType.SETTLEMENT:
      resources.brick -= BUILD_COSTS.Settlement.brick;
      resources.wood -= BUILD_COSTS.Settlement.wood;
      resources.sheep -= BUILD_COSTS.Settlement.sheep;
      resources.wheat -= BUILD_COSTS.Settlement.wheat;
      break;
    case BuildingType.CITY:
      resources.wheat -= BUILD_COSTS.City.wheat;
      resources.ore -= BUILD_COSTS.City.ore;
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
    case BuildingType.ROAD:
      if (
        resources.brick >= BUILD_COSTS.Road.brick &&
        resources.wood >= BUILD_COSTS.Road.wood
      )
        return true;
      break;
    case BuildingType.SETTLEMENT:
      if (
        resources.brick >= BUILD_COSTS.Settlement.brick &&
        resources.wood >= BUILD_COSTS.Settlement.wood &&
        resources.sheep >= BUILD_COSTS.Settlement.sheep &&
        resources.wheat >= BUILD_COSTS.Settlement.wheat
      )
        return true;
      break;
    case BuildingType.CITY:
      if (
        resources.wheat >= BUILD_COSTS.City.wheat &&
        resources.ore >= BUILD_COSTS.City.ore
      )
        return true;
      break;
    default:
      break;
  }
  return false;
}

function applyResourceFx(
  fx: MagicDiceEffect | undefined,
  username: string,
  resources: Resources,
  resource: keyof Resources,
): void {
  if (!fx || fx.kind !== 'resource') return;

  const applies =
    fx.target === 'collective' ||
    (fx.target === 'personal' && fx.playerConcerned === username);
  if (!applies) return;

  const delta = fx.sign === 'plus' ? fx.val : -fx.val;
  resources[resource] += delta;
}

export function produceResources(
  land: LandType,
  resources: Resources,
  multiplier: number,
  username: string,
  isCity?: boolean,
  fx?: MagicDiceEffect,
): number {
  switch (land) {
    case LandType.DESERT: {
      return 0;
    }
    case LandType.FIELD: {
      if (isCity) resources.wheat += 2 * multiplier;
      else resources.wheat += 1 * multiplier;
      applyResourceFx(fx, username, resources, 'wheat');
      break;
    }
    case LandType.FOREST: {
      if (isCity) resources.wood += 2 * multiplier;
      else resources.wood += 1 * multiplier;
      applyResourceFx(fx, username, resources, 'wood');
      break;
    }
    case LandType.HILL: {
      if (isCity) resources.brick += 2 * multiplier;
      else resources.brick += 1 * multiplier;
      applyResourceFx(fx, username, resources, 'brick');
      break;
    }
    case LandType.MOUNTAIN: {
      if (isCity) resources.ore += 2 * multiplier;
      else resources.ore += 1 * multiplier;
      applyResourceFx(fx, username, resources, 'ore');
      break;
    }
    case LandType.PASTURE: {
      if (isCity) resources.sheep += 2 * multiplier;
      else resources.sheep += 1 * multiplier;
      applyResourceFx(fx, username, resources, 'sheep');
      break;
    }
    default:
      return 0;
  }
  return isCity ? 2 * multiplier : 1 * multiplier;
}
