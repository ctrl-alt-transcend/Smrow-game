import { useState, useCallback, useId } from 'react';
import {
    TileProps,
    RoadProps,
    SettlementProps,
    HoverEntity } from '../types/gameboard.types';

/** @description generic hook to handle hover */
export const useHover = (
  controlledHover?: boolean,
  onControlledHoverChange?: (isHovered: boolean) => void
): { isHovered: boolean; onMouseEnter: () => void; onMouseLeave: () => void } => {
  const [localHovered, setLocalHovered] = useState(false);
  const isHovered = controlledHover !== undefined ? controlledHover : localHovered;

  //const [hovered, setHovered] = useState<HoverEntity>(null);
  //const handleTileHover = (isHovered: boolean, tile: TileProps) => {
  //  setHovered(isHovered ? { type: 'tile', q: tile.data.q, r: tile.data.r } : null);
  //};
  //const handleRoadHover = (isHovered: boolean, road: RoadProps) => {
  //  setHovered(isHovered ? { type: 'road', id: road.data.id } : null);
  //};
  //const handleSettlementHover = (isHovered: boolean, settlement: SettlementProps) => {
  //  setHovered(isHovered ? { type: 'settlement', id: settlement.data.id } : null);
  //};

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

export const useGameBoardHover = () => {
  const [hovered, setHovered] = useState<HoverEntity>(null);
  const handleTileHover = (isHovered: boolean, tile: TileProps) => {
    setHovered(isHovered ? { type: 'tile', q: tile.data.q, r: tile.data.r } : null);
  };
  const handleRoadHover = (isHovered: boolean, road: RoadProps) => {
    setHovered(isHovered ? { type: 'road', id: road.data.id } : null);
  };
  const handleSettlementHover = (isHovered: boolean, settlement: SettlementProps) => {
    setHovered(isHovered ? { type: 'settlement', id: settlement.data.id } : null);
  };

  // Helper pour vérifier
  const isTileHovered = (hovered: HoverEntity, tile: TileProps) =>
    hovered?.type === 'tile' && hovered.q === tile.data.q && hovered.r === tile.data.r;
  const isRoadHovered = (hovered: HoverEntity, road: RoadProps) =>
    hovered?.type === 'road' && hovered.id === road.data.id;
  const isSettlementHovered = (hovered: HoverEntity, settlement: SettlementProps) =>
    hovered?.type === 'settlement' && hovered.id === settlement.data.id;
};
