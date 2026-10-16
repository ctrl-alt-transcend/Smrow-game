import { useGameBoardSelection } from './useGameBoardSelection';
import { useGameBoardHover } from './useGameBoardHover';
import type { TileData } from '../types/gameboard.types';

/** @description "factory" hook combining: calculated board game, selected state, hover state and handlers */
export const useGameBoardFactory = (layout: TileData[]) => {
  const selectionState = useGameBoardSelection();
  const hoverState = useGameBoardHover();

  return {
    layout,
    ...selectionState,
    ...hoverState,
  };
};