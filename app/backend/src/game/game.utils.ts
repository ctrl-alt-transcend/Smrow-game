import type {
  Player
} from '@shared/game/game.types';

//TODO: use PlayerProfile instead of playerId
export function createPlayer( playerId: string ): Player {
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

export function changeGameMasterLog(message: string) {

}
