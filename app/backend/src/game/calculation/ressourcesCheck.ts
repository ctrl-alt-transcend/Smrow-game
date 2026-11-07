import { Ressources } from 'shared';
import { Buildings, GameBoardGraph, LandType } from 'shared';

const addRessources = (land: LandType, ressources: Ressources) => {
  switch (land) {
    case 'desert':
      break;
    case 'field':
      ressources.hay++;
      break;
    case 'forest':
      ressources.wood++;
      break;
    case 'hill':
      ressources.brick++;
      break;
    case 'mountain':
      ressources.rock++;
      break;
    case 'pasture':
      ressources.sheep++;
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
        addRessources(tile.land, player.ressources);
      }
    });
  }
};
