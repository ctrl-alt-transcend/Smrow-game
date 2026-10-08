import { useState, useCallback } from 'react';
import {
    Edge,
    Vertex,
    TileData,
    RoadData,
    SettlementData,
    classicLayout,
    HoverEntity } from '../types/gameboard.types';

/** @description generic hook to handle hover */
export const useHover = (
  controlledHover?: boolean,
  onControlledHoverChange?: (isHovered: boolean) => void
): { isHovered: boolean; onMouseEnter: () => void; onMouseLeave: () => void } => {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = controlledHover !== undefined ? controlledHover : localHovered;

  const [hovered, setHovered] = useState<HoverEntity>(null);
  const handleTileHover = (isHovered: boolean, tile: TileData) => {
    setHovered(isHovered ? { type: 'tile', q: tile.q, r: tile.r } : null);
  };
  const handleRoadHover = (isHovered: boolean, road: RoadData) => {
    setHovered(isHovered ? { type: 'road', id: road.id } : null);
  };
  const handleSettlementHover = (isHovered: boolean, settlement: SettlementData) => {
    setHovered(isHovered ? { type: 'settlement', id: settlement.id } : null);
  };

  //// Helper pour vérifier
  //const isTileHovered = (hovered: HoverEntity, tile: TileData) =>
  //  hovered?.type === 'tile' && hovered.q === tile.q && hovered.r === tile.r;
  //const isRoadHovered = (hovered: HoverEntity, road: RoadData) =>
  //  hovered?.type === 'road' && hovered.id === road.id;
  //const isSettlementHovered = (hovered: HoverEntity, settlement: SettlementData) =>
  //  hovered?.type === 'settlement' && hovered.id === settlement.id;

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
