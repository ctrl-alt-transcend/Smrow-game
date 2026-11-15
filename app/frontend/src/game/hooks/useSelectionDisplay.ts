import { BUILD_COSTS, LAND_RESOURCE } from "shared";
import type { GameBoardSelection } from "../types/gameboard.types";

export interface SelectionItem {
  label: string;
}

export const useSelectionDisplay = (
  selected: GameBoardSelection,
): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    items.push({ label: `Land: ${selected.selectedTile.land}` });
    items.push({
      label: `Resource: ${LAND_RESOURCE[selected.selectedTile.land]}`,
    });
    if (selected.selectedTile.hasRobber)
      items.push({
        label: `Robert the Robber will rob all the ${LAND_RESOURCE[selected.selectedTile.land]} you produce from this ${selected.selectedTile.land}`,
      });
  }
  if (selected.selectedSettlement) {
    if (selected.selectedSettlement.ownerId) {
      items.push({ label: `Landlord: ${selected.selectedSettlement.ownerId}` });
      if (!selected.selectedSettlement.isCity) {
        items.push({ label: `Cost to upgrade:` });
        items.push({ label: `Wheat: ${BUILD_COSTS.City.wheat}` });
        items.push({ label: `Ore: ${BUILD_COSTS.City.ore}` });
      }
    } else {
      items.push({ label: `Cost to build:` });
      items.push({ label: `Wood: ${BUILD_COSTS.Settlement.wood}` });
      items.push({ label: `Brick: ${BUILD_COSTS.Settlement.brick}` });
      items.push({ label: `Wheat: ${BUILD_COSTS.Settlement.wheat}` });
      items.push({ label: `Sheep: ${BUILD_COSTS.Settlement.sheep}` });
    }
  }
  if (selected.selectedRoad) {
    if (selected.selectedRoad.ownerId) {
      items.push({ label: `Landlord: ${selected.selectedRoad.ownerId}` });
    } else {
      items.push({ label: `Cost to build:` });
      items.push({ label: `Wood: ${BUILD_COSTS.Road.wood}` });
      items.push({ label: `Brick: ${BUILD_COSTS.Road.brick}` });
    }
  }
  if (selected.selectedCoast) {
    if (
      selected.selectedCoast.port &&
      selected.selectedCoast.port.type === "generic"
    )
      items.push({ label: "Generic Port" });
    else if (selected.selectedCoast.port)
      items.push({ label: "Specialized Port" });
  }
  if (selected.selectedReserve) {
    items.push({ label: `Shnek the Trader` });
  }
  return items;
};
