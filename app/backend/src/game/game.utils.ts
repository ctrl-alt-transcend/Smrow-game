import type { Player, BuildRequestPayload } from '@shared/game/game.types';

// TODO: move to DTO??
export function isBuildRequestPayload(p: unknown): p is BuildRequestPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (o.kind !== 'road' && o.kind !== 'settlement') return false;
  return (
    typeof o.id === 'string' && typeof o.data === 'object' && o.data !== null
  );
}

export function updateValue(
  currentValue: number,
  limit: number,
  newValue: number | undefined,
): number {
  if (newValue !== undefined) {
    return newValue;
  } else if (currentValue + 1 === limit) {
    return 0;
  } else {
    return currentValue + 1;
  }
}

export function funnyLogs(id: string, value: number): string {
  if (value <= 3) {
    return `${id} got an almost useless ${value}...`;
  }
  if (value > 3 && value <= 6) {
    return `${id} got a tiny little ${value}...`;
  }
  if (value > 6 && value <= 9) {
    return `${id} got a solid ${value}.`;
  }
  if (value > 9 && value <= 12) {
    return `${id} got a huge ${value}!`;
  }
  return `${id} rolled a ${value}`;
}

export function printPlayer(p: Player) {
  console.log(`🖨️ printPlayer: ${p.playerId}:`);
  console.log(`- wood: ${p.ressources.wood}`);
  console.log(`- sheep: ${p.ressources.sheep}`);
  console.log(`- brick: ${p.ressources.brick}`);
  console.log(`- rock: ${p.ressources.rock}`);
  console.log(`- hay: ${p.ressources.hay}`);
}

export function printAllPlayers(p: Map<string, Player>) {
  p.forEach((p) => {
    printPlayer(p);
  });
}
