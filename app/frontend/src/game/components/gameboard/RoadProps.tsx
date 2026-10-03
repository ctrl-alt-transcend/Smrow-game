import { useState } from 'react';
import { RoadData } from "../../types/gameboard.types";

interface RoadProps {
  data: RoadData;
  isSelected: boolean;
  isHovered: boolean;
  hasOwner?: boolean;
  onClick: (data: RoadData) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export const Road: React.FC<RoadProps> = ({
  data,
  isSelected,
  isHovered,
  hasOwner,
  onClick,
  onHoverChange }) => {
  const [localHovered, setLocalHovered] = useState(false);
  const effectiveIsHovered = isHovered ?? localHovered;

  const handleMouseEnter = () => {
    if (isHovered !== undefined) {
      onHoverChange?.(true);
    } else {
      setLocalHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isHovered !== undefined) {
      onHoverChange?.(false);
    } else {
      setLocalHovered(false);
    }
  };

  return (
    <line
      x1={data.edge.p1.x}
      y1={data.edge.p1.y}
      x2={data.edge.p2.x}
      y2={data.edge.p2.y}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      stroke={isSelected ? '#ff0000' : effectiveIsHovered ? '#cc0000' : '#e0e0e0'} // ← stroke, pas fill
      strokeWidth={isSelected ? 8 : 6}
      strokeLinecap="round"
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: 'pointer' }}
      data-type="road"
    />
  );
};
