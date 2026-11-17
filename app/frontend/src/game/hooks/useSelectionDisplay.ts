import {
  BUILD_COSTS,
  LAND_RESOURCE,
  ROBBER_NAME,
  RESERVE_NAME,
  type SettingsData,
} from "shared";
import type { GameBoardSelection } from "../types/gameboard.types";

export interface SelectionItem {
  label: string;
}

export const useSelectionDisplay = (
  selected: GameBoardSelection,
  settings: SettingsData,
): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    items.push({ label: `Land: ${selected.selectedTile.land}` });
    items.push({
      label: `Resource: ${LAND_RESOURCE[selected.selectedTile.land]}`,
    });
    if (selected.selectedTile.hasRobber)
      items.push({
        label: `${ROBBER_NAME}`,
      });
  }
  if (selected.selectedSettlement) {
    if (selected.selectedSettlement.ownerId) {
      items.push({ label: `Landlord: ${selected.selectedSettlement.ownerId}` });
      if (!selected.selectedSettlement.isCity) {
        items.push({ label: `Cost to upgrade:` });
        items.push({ label: `Wheat: ${BUILD_COSTS.City.wheat}` });
        items.push({ label: `Ore: ${BUILD_COSTS.City.ore}` });
        items.push({
          label: `Generates ${settings.cityPoints} victory point on upgrade.`,
        });
      }
    } else {
      items.push({ label: `Cost to build:` });
      items.push({ label: `Wood: ${BUILD_COSTS.Settlement.wood}` });
      items.push({ label: `Brick: ${BUILD_COSTS.Settlement.brick}` });
      items.push({ label: `Wheat: ${BUILD_COSTS.Settlement.wheat}` });
      items.push({ label: `Sheep: ${BUILD_COSTS.Settlement.sheep}` });
      items.push({
        label: `Generates ${settings.settlementPoints} victory point on build.`,
      });
    }
  }
  if (selected.selectedRoad) {
    if (selected.selectedRoad.ownerId) {
      items.push({ label: `Landlord: ${selected.selectedRoad.ownerId}` });
    } else {
      items.push({ label: `Cost to build:` });
      items.push({ label: `Wood: ${BUILD_COSTS.Road.wood}` });
      items.push({ label: `Brick: ${BUILD_COSTS.Road.brick}` });
      items.push({
        label: `Generates ${settings.roadPoints} victory point on build.`,
      });
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
    items.push({ label: `${RESERVE_NAME}` });
  }
  return items;
};
