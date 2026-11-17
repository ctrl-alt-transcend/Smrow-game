import {
  BUILD_COSTS,
  LAND_RESOURCE,
  ROBBER_NAME,
  RESERVE_NAME,
  type SettingsData,
  ResourceType,
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
    items.push({ label: `${selected.selectedTile.land}` });
    items.push({
      label: `• produces ${LAND_RESOURCE[selected.selectedTile.land]}`,
    });
    if (selected.selectedTile.hasRobber) {
      items.push({ label: `• ${ROBBER_NAME} is here, watchout!` });
    }
  }
  if (selected.selectedSettlement) {
    if (selected.selectedSettlement.ownerId) {
      if (!selected.selectedSettlement.isCity) {
        items.push({
          label: `Settlement owned by : ${selected.selectedSettlement.ownerId}`,
        });
        items.push({ label: `Cost to upgrade :` });
        items.push({
          label: `• ${BUILD_COSTS.City.wheat} ${ResourceType.WHEAT}`,
        });
        items.push({ label: `• ${BUILD_COSTS.City.ore} ${ResourceType.ORE}` });
        items.push({
          label: `Generates ${settings.cityPoints} victory point`,
        });
      } else {
        items.push({
          label: `City owned by : ${selected.selectedSettlement.ownerId}`,
        });
      }
    } else {
      items.push({ label: `Settlement - cost to build :` });
      items.push({
        label: `• ${BUILD_COSTS.Settlement.wood} ${ResourceType.WOOD}`,
      });
      items.push({
        label: `• ${BUILD_COSTS.Settlement.brick} ${ResourceType.BRICK}`,
      });
      items.push({
        label: `• ${BUILD_COSTS.Settlement.wheat} ${ResourceType.WHEAT}`,
      });
      items.push({
        label: `• ${BUILD_COSTS.Settlement.sheep} ${ResourceType.SHEEP}`,
      });
      items.push({
        label: `Generates ${settings.settlementPoints} victory point`,
      });
    }
  }
  if (selected.selectedRoad) {
    if (selected.selectedRoad.ownerId) {
      items.push({ label: `Road owned by : ${selected.selectedRoad.ownerId}` });
    } else {
      items.push({ label: `Road - cost to build :` });
      items.push({ label: `• ${BUILD_COSTS.Road.wood} ${ResourceType.WOOD}` });
      items.push({
        label: `• ${BUILD_COSTS.Road.brick} ${ResourceType.BRICK}`,
      });
      items.push({
        label: `Generates ${settings.roadPoints} victory point`,
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
