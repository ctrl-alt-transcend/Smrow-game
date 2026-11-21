import { Logger } from '@nestjs/common';
import type { Player, BuildPayload, TradePayload } from 'shared';
import { TraderType } from 'shared';

const logger = new Logger('GameUtils');

// TODO: move to DTO??
export function isBuildPayload(p: unknown): p is BuildPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (o.kind !== 'road' && o.kind !== 'settlement') return false;
  return (
    typeof o.id === 'string' && typeof o.data === 'object' && o.data !== null
  );
}

export function isTradePayload(p: unknown): p is TradePayload {
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
    return `got an almost useless ${value} in total ...`;
  } else if (value > 3 && value <= 6) {
    return `got a tiny little ${value} in total ...`;
  } else if (value === 7) {
    return `got a damned ${value} in total !`;
  } else if (value > 7 && value <= 9) {
    return `got a solid ${value} in total .`;
  } else if (value > 9 && value <= 12) {
    return `got a huge ${value} in total !`;
  }
  return `rolled a ${value}`;
}

export function printPlayer(p: Player) {
  logger.debug(
    `🖨️ printPlayer: ${p.username}: ` +
      `wood=${p.resources.wood} sheep=${p.resources.sheep} ` +
      `brick=${p.resources.brick} ore=${p.resources.ore} wheat=${p.resources.wheat}`,
  );
}

export function printAllPlayers(p: Map<string, Player>) {
  p.forEach((p) => {
    printPlayer(p);
  });
}
