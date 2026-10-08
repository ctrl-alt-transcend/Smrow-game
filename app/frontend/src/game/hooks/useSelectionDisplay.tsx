import { GameBoardState } from '../types/gameboard.types';

export interface SelectionItem {
  type: 'tile' | 'settlement' | 'road';
  label: string;
}

export const useSelectionDisplay = (selected: GameBoardState): SelectionItem[] => {
  const items: SelectionItem[] = [];

  if (selected.selectedTile) {
    items.push({ type: 'tile', label: `Tile: (${selected.selectedTile.q}, ${selected.selectedTile.r})` });
  }
  if (selected.selectedSettlement) {
    items.push({ type: 'settlement', label: `Settlement: ${selected.selectedSettlement.id}` });
  }
  if (selected.selectedRoad) {
    items.push({ type: 'road', label: `Road: ${selected.selectedRoad.id}` });
  }

  return items;
};