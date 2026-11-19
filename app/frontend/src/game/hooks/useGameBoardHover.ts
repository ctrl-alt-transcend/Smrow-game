import { useState, useCallback } from "react";
import type { HoverEntity } from "../types/gameboard.types";
import {
  type TileData,
  type RoadData,
  type SettlementData,
  type CoastData,
  type ReserveData,
  ROAD,
  SETTLEMENT,
  TILE,
  COAST,
  RESERVE,
} from "shared";

/** @description generic hook for gameboard interactive elements */
export const useHover = (
  controlledHover?: boolean,
  onControlledHoverChange?: (isHovered: boolean) => void,
): {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} => {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = controlledHover ?? localHovered;

  const onMouseEnter = useCallback(() => {
    if (controlledHover === undefined) {
      setLocalHovered(true);
    } else {
      onControlledHoverChange?.(true);
    }
  }, [controlledHover, onControlledHoverChange]);

  const onMouseLeave = useCallback(() => {
    if (controlledHover === undefined) {
      setLocalHovered(false);
    } else {
      onControlledHoverChange?.(false);
    }
  }, [controlledHover, onControlledHoverChange]);

  return { isHovered, onMouseEnter, onMouseLeave };
};

/** @description hook hover handlers */
export const useGameBoardHover = () => {
  const [hovered, setHovered] = useState<HoverEntity>(null);

  const handleTileHover = useCallback((isHovered: boolean, tile: TileData) => {
    setHovered(isHovered ? { type: TILE, q: tile.q, r: tile.r } : null);
  }, []);

  const handleRoadHover = useCallback((isHovered: boolean, road: RoadData) => {
    setHovered(isHovered ? { type: ROAD, id: road.id } : null);
  }, []);

  const handleSettlementHover = useCallback(
    (isHovered: boolean, settlement: SettlementData) => {
      setHovered(isHovered ? { type: SETTLEMENT, id: settlement.id } : null);
    },
    [],
  );

  const handleCoastHover = useCallback(
    (isHovered: boolean, coast: CoastData) => {
      setHovered(isHovered ? { type: COAST, id: coast.id } : null);
    },
    [],
  );

  const handleReserveHover = useCallback(
    (isHovered: boolean, reserve: ReserveData) => {
      setHovered(isHovered ? { type: RESERVE, id: reserve.id } : null);
    },
    [],
  );

  const isTileHovered = useCallback(
    (tile: TileData) =>
      hovered?.type === TILE && hovered.q === tile.q && hovered.r === tile.r,
    [hovered],
  );

  const isRoadHovered = useCallback(
    (road: RoadData) => hovered?.type === ROAD && hovered.id === road.id,
    [hovered],
  );

  const isCoastHovered = useCallback(
    (coast: CoastData) => hovered?.type === COAST && hovered.id === coast.id,
    [hovered],
  );

  const isSettlementHovered = useCallback(
    (settlement: SettlementData) =>
      hovered?.type === SETTLEMENT && hovered.id === settlement.id,
    [hovered],
  );

  const isReserveHovered = useCallback(
    (reserve: ReserveData) =>
      hovered?.type === RESERVE && hovered.id === reserve.id,
    [hovered],
  );

  return {
    hovered,
    handleTileHover,
    handleRoadHover,
    handleCoastHover,
    handleSettlementHover,
    handleReserveHover,
    isTileHovered,
    isRoadHovered,
    isSettlementHovered,
    isCoastHovered,
    isReserveHovered,
  };
};
