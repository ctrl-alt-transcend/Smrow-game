import type { GameBoardSelection } from "../types/gameboard.types";

export interface SelectionItem {
  type: "tile" | "settlement" | "road";
  label: string;
}

export const useSelectionDisplay = (
  selected: GameBoardSelection,
): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    items.push({
      type: "tile",
      label: `Tile: ${selected.selectedTile.q}, ${selected.selectedTile.r}`,
    });
    items.push({ type: "tile", label: `Land: ${selected.selectedTile.land}` });
  }
  if (selected.selectedSettlement) {
    items.push({
      type: "settlement",
      label: `Settlement: ${selected.selectedSettlement.id}`,
    });
    items.push({
      type: "settlement",
      label: `Faction: ${selected.selectedSettlement.faction}`,
    });
  }
  if (selected.selectedRoad) {
    items.push({ type: "road", label: `Road: ${selected.selectedRoad.id}` });
    items.push({
      type: "road",
      label: `Faction: ${selected.selectedRoad.faction}`,
    });
  }

  return items;
};
