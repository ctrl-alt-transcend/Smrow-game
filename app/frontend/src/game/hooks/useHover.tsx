import { useState, useCallback } from 'react';

/**
 * Generic hook to handle hover
 *
 * Supports two modes: controlled ( parent in 'GameBoard )
 * or uncontrolled (local in '*Tile')
 *
 * Priority: controlled > local
 */
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