import type { TileProps } from '../../types/gameboard.types';
import { useHover } from '../../hooks/useGameBoardHover';
import { axialToPixel, HEX_SIZE } from '../../utils/hexCalculation';
import {
  getTileFillColor,
  getTileStrokeColor,
  getTileStrokeWidth } from '../../utils/tileRendering';

export const HexTile: React.FC<TileProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);
  const fillColor = getTileFillColor(data.land, null, isSelected, effectiveIsHovered);
  const strokeColor = getTileStrokeColor(effectiveIsHovered);
  const strokeWidth = getTileStrokeWidth(effectiveIsHovered);
  const { x: centerX, y: centerY } = axialToPixel(data.q, data.r, HEX_SIZE);
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle_rad = ((Math.PI / 180) * (60 * i - 30));
    const x = centerX + HEX_SIZE * Math.cos(angle_rad);
    const y = centerY + HEX_SIZE * Math.sin(angle_rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <polygon
      points={points}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
