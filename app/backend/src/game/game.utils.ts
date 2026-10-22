import type {
  Player
} from '../../shared/game/game.types';

export function createPlayer( playerId: string ): Player {
    return {
      playerId: playerId,
      score: 0,
      firstDice: 0,
      secondDice: 0,
      settlementsBuilt: 0,
      roadsBuilt: 0,
      ressources: {
        wood: 0,
        brick: 0,
        hay: 0,
        sheep: 0,
        rock: 0,
      },
      //color TODO: add color to player
    };
  }