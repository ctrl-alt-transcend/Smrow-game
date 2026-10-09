import { useState, useCallback } from 'react';
import { TileData, SettlementData, RoadData, GameBoardState } from '../types/gameboard.types';

const resetSelection = (): GameBoardState => ({
  selectedTile: null,
  selectedSettlement: null,
  selectedRoad: null
});

export const useGameBoardSelection = () => {
  const [selected, setSelected] = useState<GameBoardState>(resetSelection());

  const handleTileClick = useCallback((tile: TileData | null) => {
    setSelected(prev => {
      if (!tile) return resetSelection();
      const isSameTile = prev.selectedTile?.q === tile.q && prev.selectedTile?.r === tile.r;
      return isSameTile ?
        resetSelection() : { ...resetSelection(), selectedTile: tile };
    });
  }, []);

  const handleSettlementClick = useCallback((settlement: SettlementData | null) => {
    setSelected(prev => {
      if (!settlement) return resetSelection();
      const isSameSettlement = prev.selectedSettlement?.id === settlement.id;
      return isSameSettlement ?
        resetSelection() : { ...resetSelection(), selectedSettlement: settlement };
    });
  }, []);

  const handleRoadClick = useCallback((road: RoadData | null) => {
    setSelected(prev => {
      if (!road) return resetSelection();
      const isSameRoad = prev.selectedRoad?.id === road.id;
      return isSameRoad ?
        resetSelection() : { ...resetSelection(), selectedRoad: road };
    });
  }, []);

  const clearSelection = useCallback(() => {
    return resetSelection();
  }, []);

  return { selected, handleTileClick, handleRoadClick, handleSettlementClick, clearSelection };
};