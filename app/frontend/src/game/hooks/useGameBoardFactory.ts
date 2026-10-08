import { useMemo } from 'react';
import { calculateGameBoardData } from '../utils/gameBoardCalculation';
import { useGameBoardSelection } from './useGameBoardSelection';
import { useGameBoardHover } from './useGameBoardHover';
import { TileData } from '../types/gameboard.types';

/**
 * Hook "usine" qui combine :
 * - Données calculées (vertices, edges, etc.)
 * - État de sélection
 * - État de hover
 * - Handlers prêts à l'emploi
 */
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