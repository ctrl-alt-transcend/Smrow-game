import { useMemo } from 'react';
import { calculateGameBoardData } from '../utils/gameBoardCalculation';
import { useGameBoardSelection } from './useGameBoardSelection';
import { useGameBoardHover } from './useGameBoardHover';
import type { TileData } from '../types/gameboard.types';

/** @description "factory" hook combining: calculated board game, selected state, hover state and handlers */
export const useGameBoardFactory = (tiles: TileData[]) => {
  const boardData = useMemo(() => calculateGameBoardData(tiles), [tiles]);
  const selectionState = useGameBoardSelection();
  const hoverState = useGameBoardHover();

  return {
    boardData,
    ...selectionState,
    ...hoverState,
  };
};