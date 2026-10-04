import { useState, useCallback } from 'react';

/**
 * Hook générique pour gérer le survol
 * Supporte deux modes : controlled (parent) ou uncontrolled (local)
 */
export const useHover = (
  controlledHover?: boolean,
  onControlledHoverChange?: (isHovered: boolean) => void
): { isHovered: boolean; onMouseEnter: () => void; onMouseLeave: () => void } => {
  const [localHovered, setLocalHovered] = useState(false);

  // Priorité : controlled > local
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