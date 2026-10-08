import { useMemo } from 'react';
import { TileData, GameBoardData } from '../types/gameboard.types';
import { calculateGameBoardData } from '../utils/gameBoardCalculation';

/**
 * Hook React qui appelle calculateGameBoardData() avec memoization
 *
 * Pourquoi useMemo ?
 * - Empêche le recalcul à chaque render si les données ne changent pas
 * - Économise des cycles CPU sur grands plateaux
 * - Garde la référence stable pour éviter re-renders enfants inutiles
 */
export const useGameBoardData = (tiles: TileData[]): GameBoardData => {
  return useMemo(() => {
    return calculateGameBoardData(tiles);
  }, [tiles]); // Recalcul seulement si les tuiles changent
};