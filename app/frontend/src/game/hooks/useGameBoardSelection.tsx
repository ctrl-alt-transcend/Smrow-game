import { useState, useCallback } from 'react';
import {
  TileData,
  RoadData,
  SettlementData,
  GameBoardState } from '../types/gameboard.types';

export const useGameBoardSelection = () => {
  const [selected, setSelected] = useState<GameBoardState>({
    selectedTile: null,
    selectedSettlement: null,
    selectedRoad: null
  });

  const handleTileClick = useCallback((tile: TileData | null) => {
    setSelected(prev => ({
      ...prev,
      selectedTile: tile,
      selectedSettlement: null,
      selectedRoad: null
    }));
  }, []);

  const handleSettlementClick = useCallback((settlement: SettlementData | null) => {
    setSelected(prev => ({
      ...prev,
      selectedSettlement: settlement,
      selectedTile: null,
      selectedRoad: null
    }));
  }, []);

  const handleRoadClick = useCallback((road: RoadData | null) => {
    setSelected(prev => ({
      ...prev, selectedRoad: road,
      selectedTile: null,
      selectedSettlement: null
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSelected({
      selectedTile: null,
      selectedSettlement: null,
      selectedRoad: null
    });
  }, []);

  return { selected, handleTileClick, handleSettlementClick, handleRoadClick, clearAll };
};