import { TileProps } from '../../types/shared.types';
import { useHover } from '../../hooks/useHover';
import { axialToPixel, HEX_SIZE } from '../../utils/hexRendering';

export const HexTile: React.FC<TileProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);
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
      fill={isSelected ? '#fffacd' : effectiveIsHovered ? '#e8e8ff' : '#e0e0e0'}
      stroke={effectiveIsHovered ? '#666' : '#444'}
      strokeWidth={effectiveIsHovered ? '3' : '2'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
