import type {
  Player,
  Ressources
} from '../../shared/game/game.types';

function initRessources(): Ressources {
  return {
    wood: 0,
    brick: 0,
    hay: 0,
    sheep: 0,
    rock: 0,
  };
}

export function initPlayer( playerId: string ): Player {
    return {
      playerId: playerId,
      score: 0,
      firstDice: 0,
      secondDice: 0,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      ressources: initRessources()
      //color TODO: add color to player
    };
  }