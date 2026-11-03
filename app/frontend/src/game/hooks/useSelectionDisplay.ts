import type { GameBoardSelection } from "../types/gameboard.types";

export interface SelectionItem {
  label: string;
}

export const useSelectionDisplay = (
  selected: GameBoardSelection,
): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    items.push({label: `Tile: ${selected.selectedTile.q}, ${selected.selectedTile.r}`});
    items.push({label: `Land: ${selected.selectedTile.land}`});
  }
  if (selected.selectedSettlement) {
    items.push({label: `Settlement: ${selected.selectedSettlement.id}`});
    items.push({label: `Faction: ${selected.selectedSettlement.faction}`});
    if (selected.selectedSettlement.ownerId)
      items.push({label: `Landlord: ${selected.selectedSettlement.ownerId}`});
  }
  if (selected.selectedRoad) {
    items.push({label: `Road: ${selected.selectedRoad.id}` });
    items.push({label: `Faction: ${selected.selectedRoad.faction}`});
    if (selected.selectedRoad.ownerId)
      items.push({label: `Landlord: ${selected.selectedRoad.ownerId}`});
  }

  return items;
};
