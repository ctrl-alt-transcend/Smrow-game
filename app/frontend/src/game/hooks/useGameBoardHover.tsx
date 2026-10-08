import { useState, useCallback } from 'react';
import {
  TileData,
  RoadData,
  SettlementData,
  HoverEntity } from '../types/gameboard.types';

/** @description generic hook for gameboard interactive elements */
export const useHover = (
  controlledHover?: boolean,
  onControlledHoverChange?: (isHovered: boolean) => void
): { isHovered: boolean; onMouseEnter: () => void; onMouseLeave: () => void } => {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = controlledHover !== undefined ? controlledHover : localHovered;

  const onMouseEnter = useCallback(() => {
    if (controlledHover !== undefined) {
      onControlledHoverChange?.(true);
    } else {
      setLocalHovered(true);
    }
  }, [controlledHover, onControlledHoverChange]);

  const onMouseLeave = useCallback(() => {
    if (controlledHover !== undefined) {
      onControlledHoverChange?.(false);
    } else {
      setLocalHovered(false);
    }
  }, [controlledHover, onControlledHoverChange]);

  return { isHovered, onMouseEnter, onMouseLeave };
};

/** @description hook hover handlers */
export const useGameBoardHover = () => {
  const [hovered, setHovered] = useState<HoverEntity>(null);

  const handleTileHover = useCallback((isHovered: boolean, tile: TileData) => {
    setHovered(isHovered ? { type: 'tile', q: tile.q, r: tile.r } : null);
  }, []);

  const handleRoadHover = useCallback((isHovered: boolean, road: RoadData) => {
    setHovered(isHovered ? { type: 'road', id: road.id } : null);
  }, []);

  const handleSettlementHover = useCallback((isHovered: boolean, settlement: SettlementData) => {
    setHovered(isHovered ? { type: 'settlement', id: settlement.id } : null);
  }, []);

  const isTileHovered = useCallback((tile: TileData) =>
    hovered?.type === 'tile' && hovered.q === tile.q && hovered.r === tile.r,
  [hovered]);

  const isRoadHovered = useCallback((road: RoadData) =>
    hovered?.type === 'road' && hovered.id === road.id,
  [hovered]);

  const isSettlementHovered = useCallback((settlement: SettlementData) =>
    hovered?.type === 'settlement' && hovered.id === settlement.id,
  [hovered]);

  return {
    hovered,
    handleTileHover,
    handleRoadHover,
    handleSettlementHover,
    isTileHovered,
    isRoadHovered,
    isSettlementHovered,
  };
};
