import { useState } from 'react';
import { TileData, HEX_SIZE } from '../../types/gameboard.types';
import { axialToPixel } from '../../utils/hexRendering'


interface HexTileProps {
  data: TileData;
  isSelected: boolean;
  isHovered: boolean;
  hasOwner?: boolean;
  onClick: (data: TileData) => void;
  onHoverChange?: (isHovered: boolean) => void;
}

export const HexTile: React.FC<HexTileProps> = ({
  data,
  isSelected,
  isHovered,
  hasOwner,
  onClick,
  onHoverChange }) => {
  const [localHovered, setLocalHovered] = useState(false);
  const effectiveIsHovered = isHovered ?? localHovered;
  const { x: centerX, y: centerY } = axialToPixel(data.q, data.r, HEX_SIZE);
  const hexRadius = HEX_SIZE;

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

  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + hexRadius * Math.cos(angle_rad);
    const y = centerY + hexRadius * Math.sin(angle_rad);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return (
    <polygon
      //{...hoverProps}
      points={points.join(' ')}
      fill={isSelected ? '#ff0000' : effectiveIsHovered ? '#3cc700' : '#2a8c00'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      stroke="#444"
      strokeWidth="2"
      onClick={() => onClick(data)}
      style={{ cursor: 'pointer' }}
      data-type="tile"
      data-q={data.q}
      data-r={data.r}
    />
  );
};
