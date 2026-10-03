import { useState } from 'react';
import type { SettlementData } from "../../types/gameboard.types";

interface SettlementProps {
  data: SettlementData;
  isSelected: boolean;
  isHovered: boolean;
  hasOwner?: boolean;
  onClick: (data: SettlementData) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export const Settlement: React.FC<SettlementProps> = ({
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
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={isSelected ? 8 : 6}
      fill={isSelected ? '#ff0000' : effectiveIsHovered ? '#ffc801' : '#af8900'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      stroke="#333"
      strokeWidth="1.5"
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: 'pointer' }}
      data-type="settlement"
    />
  );
};
