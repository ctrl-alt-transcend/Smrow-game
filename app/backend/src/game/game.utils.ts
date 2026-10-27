import type { Player } from '@shared/game/game.types';

export function rollDice( p: Player ): { value: number | null, message: string | null } {
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
  return { value, message };
}

export function funnyLogs( id: string, value: number ): string {
  if (value <= 3) { return `${id} got an almost useless ${value}...`; }
  if (value > 3 && value <= 6) { return `${id} got a tiny little ${value}...`; }
  if (value > 6 && value <= 9) { return `${id} got a solid ${value}.`; }
  if (value > 9 && value <= 12) { return `${id} got a huge ${value}!`; }
  return `${id} rolled a ${value}`;
}

