import type { GameResponse, Player, BuildRequestPayload } from '@shared/game/game.types';

export function isBuildRequestPayload(p: unknown): p is BuildRequestPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (o.kind !== 'road' && o.kind !== 'settlement') return false;
  return typeof o.id === 'string' && typeof o.data === 'object' && o.data !== null;
}

export function rollDice( p: Player ): GameResponse {
  let value: number | null = Math.floor(Math.random() * 6) + 1;
  let message: string | null = null;

  if (p.firstDice === 0) {
    p.firstDice = value;
    //console.log(`utils:rollDice: FIRST dice: ${p.playerId} rolled [${value}]`);
  }
  else if (p.secondDice === 0) {
    p.secondDice = value;
    //console.log(`utils:rollDice: SECOND dice: ${p.playerId} rolled [${value}]`);
  }
  else {
    value = null;
    message = `utils:rollDice: You (${p.playerId}) already rolled both dices.`;
  }
  return { value, message, board: null };
}

export function funnyLogs( id: string, value: number ): string {
  if (value <= 3) { return `${id} got an almost useless ${value}...`; }
  if (value > 3 && value <= 6) { return `${id} got a tiny little ${value}...`; }
  if (value > 6 && value <= 9) { return `${id} got a solid ${value}.`; }
  if (value > 9 && value <= 12) { return `${id} got a huge ${value}!`; }
  return `${id} rolled a ${value}`;
}

