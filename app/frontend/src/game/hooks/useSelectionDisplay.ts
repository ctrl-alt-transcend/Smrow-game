import { BUILD_COSTS, LAND_RESSOURCE } from "../../../../shared/game/gameboard.types";
import type { GameBoardSelection } from "../types/gameboard.types";

export interface SelectionItem {
  label: string;
}

export const useSelectionDisplay = (
  selected: GameBoardSelection,
): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    //items.push({label: `Tile: ${selected.selectedTile.q}, ${selected.selectedTile.r}`});
    items.push({label: `Land: ${selected.selectedTile.land}`});
    items.push({label: `Ressource: ${LAND_RESSOURCE[selected.selectedTile.land]}`});
    if (selected.selectedTile.hasRobber)
      items.push({label: `Robert the Robber`});
  }
  if (selected.selectedSettlement) {
    //items.push({label: `Settlement: ${selected.selectedSettlement.id}`});
    //items.push({label: `Faction: ${selected.selectedSettlement.faction}`});
    if (selected.selectedSettlement.ownerId) {
      items.push({label: `Landlord: ${selected.selectedSettlement.ownerId}`});
      if (!selected.selectedSettlement.isCity) {
        items.push({label: `Cost to upgrade:`});
        items.push({label: `Wheat: ${BUILD_COSTS.city.wheat}`});
        items.push({label: `Ore: ${BUILD_COSTS.city.ore}`});
      }
    }
    else {
      items.push({label: `Cost to build:`});
      items.push({label: `Wood: ${BUILD_COSTS.settlement.wood}`});
      items.push({label: `Brick: ${BUILD_COSTS.settlement.brick}`});
      items.push({label: `Wheat: ${BUILD_COSTS.settlement.wheat}`});
      items.push({label: `Sheep: ${BUILD_COSTS.settlement.sheep}`});
    }
  }
  if (selected.selectedRoad) {
    //items.push({label: `Road: ${selected.selectedRoad.id}` });
    //items.push({label: `Faction: ${selected.selectedRoad.faction}`});
    if (selected.selectedRoad.ownerId) {
      items.push({label: `Landlord: ${selected.selectedRoad.ownerId}`});
    }
    else {
      items.push({label: `Cost to build:`});
      items.push({label: `Wood: ${BUILD_COSTS.road.wood}`});
      items.push({label: `Brick: ${BUILD_COSTS.road.brick}`});
    }
  }
  if (selected.selectedCoast) {
    //items.push({label: `${selected.selectedCoast.id}` });
    if (selected.selectedCoast.port && selected.selectedCoast.port.type === 'generic')
      items.push({label: 'Generic Port'});
    else if (selected.selectedCoast.port)
      items.push({label: 'Specialized Port'});
  }
  if(selected.selectedReserve) {
    items.push({label: `Schnek the Goblin`});
  }
  return items;
};
