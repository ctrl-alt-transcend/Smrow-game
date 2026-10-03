import { useState, useCallback } from 'react';

export const useHover = <T extends HTMLElement | SVGElement>() => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
  };

  return { isHovered, hoverProps };
};