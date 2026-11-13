import type { Player, BuildRequestPayload, TradeRequestPayload } from 'shared';
import { TraderType } from 'shared';

// TODO: move to DTO??
export function isBuildRequestPayload(p: unknown): p is BuildRequestPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (o.kind !== 'road' && o.kind !== 'settlement') return false;
  return (
    typeof o.id === 'string' && typeof o.data === 'object' && o.data !== null
  );
}

export function isTradeRequestPayload(p: unknown): p is TradeRequestPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (o.trader !== TraderType) return false;
  return (
    typeof o.id === 'string' && typeof o.data === 'object' && o.data !== null
  );
}

export function updateValue(
  currentValue: number,
  limit: number,
  newValue?: number,
): number {
  if (newValue !== undefined) return newValue;
  if (currentValue + 1 === limit) {
    return 0;
  } else {
    return currentValue + 1;
  }
}

export function funnyRollLog(value: number): string {
  if (value <= 3) {
    return `got an almost useless ${value} ...`;
  } else if (value > 3 && value <= 6) {
    return `got a tiny little ${value} ...`;
  } else if (value === 7) {
    return `got a damned ${value} !`;
  } else if (value > 7 && value <= 9) {
    return `got a solid ${value} .`;
  } else if (value > 9 && value <= 12) {
    return `got a huge ${value} !`;
  }
  return `rolled a ${value}`;
}

export function printPlayer(p: Player) {
  console.log(`🖨️ printPlayer: ${p.playerId}:`);
  console.log(`- wood: ${p.resources.wood}`);
  console.log(`- sheep: ${p.resources.sheep}`);
  console.log(`- brick: ${p.resources.brick}`);
  console.log(`- ore: ${p.resources.ore}`);
  console.log(`- wheat: ${p.resources.wheat}`);
  console.log(`- roads: ${p.roadsBuilt}`);
}

export function printAllPlayers(p: Map<string, Player>) {
  p.forEach((p) => {
    printPlayer(p);
  });
}
