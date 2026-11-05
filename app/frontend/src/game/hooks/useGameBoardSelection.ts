import { useState, useCallback } from "react";
import type { GameBoardSelection } from "../types/gameboard.types";
import type {
  TileData,
  SettlementData,
  RoadData,
  CoastData
} from "@shared/game/gameboard.types";

const resetSelection = (): GameBoardSelection => ({
  selectedTile: null,
  selectedSettlement: null,
  selectedRoad: null,
  selectedCoast: null,
});

export const useGameBoardSelection = () => {
  const [selected, setSelected] =
    useState<GameBoardSelection>(resetSelection());

  const handleTileClick = useCallback((tile: TileData | null) => {
    setSelected((prev) => {
      if (!tile) return resetSelection();
      const isSameTile =
        prev.selectedTile?.q === tile.q && prev.selectedTile?.r === tile.r;
      return isSameTile
        ? resetSelection()
        : { ...resetSelection(), selectedTile: tile };
    });
  }, []);

  const handleSettlementClick = useCallback(
    (settlement: SettlementData | null) => {
      setSelected((prev) => {
        if (!settlement) return resetSelection();
        const isSameSettlement = prev.selectedSettlement?.id === settlement.id;
        return isSameSettlement
          ? resetSelection()
          : { ...resetSelection(), selectedSettlement: settlement };
      });
    },
    [],
  );

  const handleRoadClick = useCallback(
    (road: RoadData | null) => {
    setSelected((prev) => {
      if (!road) return resetSelection();
      const isSameRoad = prev.selectedRoad?.id === road.id;
      return isSameRoad
        ? resetSelection()
        : { ...resetSelection(), selectedRoad: road };
    });
  }, []);

  const handleCoastClick = useCallback(
    (coast: CoastData | null) => {
    setSelected((prev) => {
      if (!coast) return resetSelection();
      const isSameCoast = prev.selectedCoast?.id === coast.id;
      return isSameCoast
        ? resetSelection()
        : { ...resetSelection(), selectedCoast: coast };
    });
  }, []);

  const clearSelection = useCallback(() => {
    return resetSelection();
  }, []);

  return {
    selected,
    handleTileClick,
    handleRoadClick,
    handleSettlementClick,
    handleCoastClick,
    clearSelection,
  };
};
