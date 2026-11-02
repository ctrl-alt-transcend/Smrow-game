import { Ressources } from '@shared/game/game.types';
import {
  Buildings,
  GameBoardGraph,
  LandType,
} from '@shared/game/gameboard.types';

const addRessources = (
  land: LandType,
  ressources: Ressources,
  playerId: string,
) => {
  switch (land) {
    case 'desert':
      //console.log(`addRessources:${playerId}:produced nothing (desert)`);
      break;
    case 'field':
      ressources.hay++;
      //console.log(`addRessources:${playerId}:produced some hay`);
      break;
    case 'forest':
      ressources.wood++;
      //console.log(`addRessources:${playerId}:produced some wood`);
      break;
    case 'hill':
      ressources.brick++;
      //console.log(`addRessources:${playerId}:produced some brick`);
      break;
    case 'mountain':
      ressources.rock++;
      //console.log(`addRessources:${playerId}:produced some rock`);
      break;
    case 'pasture':
      ressources.sheep++;
      //console.log(`addRessources:${playerId}:produced some sheep`);
      break;
    default:
      break;
  }
};

export const ressoucesCheck = (
  buildings: Buildings,
  graph: GameBoardGraph,
  placementPhase?: boolean,
) => {
  for (const [settlement, player] of buildings) {
    const graphEntry = graph.get(settlement);
    if (!graphEntry) {
      console.log(`👀⛔ressourcesCheck:building: doesn't exists ...`);
      return { valid: false, reason: 'unknown building' };
    }
    graphEntry.adjacentTiles.forEach((tile) => {
      if (tile.value === player.totalDice || placementPhase === true) {
        addRessources(tile.land, player.ressources, player.playerId);
      }
    });
  }
};
