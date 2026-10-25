import type {
  Player,
  Ressources
} from '@shared/game/game.types';

function initRessources(): Ressources {
  return {
    wood: 0,
    brick: 0,
    hay: 0,
    sheep: 0,
    rock: 0,
  };
}

//TODO: use PlayerProfile instead of playerId
export function initPlayer( playerId: string ): Player {
  return {
    playerId: playerId,
    score: 0,
    firstDice: 0,
    secondDice: 0,
    settlementsBuilt: 0,
    roadsBuilt: 0,
      level: 1,
      username: "Username", // TODO: change this for username
      avatarURL: null,
    ressources: initRessources()
    //color TODO: add color to player
  };
}

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

