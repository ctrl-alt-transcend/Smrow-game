import { useGameBoardSelection } from "./useGameBoardSelection";
import { useGameBoardHover } from "./useGameBoardHover";
import type { GameBoard } from "../../../../shared/game/gameboard.types";

/** @description "factory" hook combining: calculated board game, selected state, hover state and handlers */
export const useGameBoardFactory = (
  board: GameBoard) => {
  const selectionState = useGameBoardSelection();
  const hoverState = useGameBoardHover();

  return {
    board,
    ...selectionState,
    ...hoverState,
  };
};
