import type { SettlementProps } from '../../types/gameboard.types';
import { useHover } from '../../hooks/useGameBoardHover';
import { getTileFillColor } from '../../utils/tileRendering';


export const Settlement: React.FC<SettlementProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);
  const fillColor = getTileFillColor(null, data.faction, isSelected, effectiveIsHovered);

  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={effectiveIsHovered ? 12 : 10}
      fill={fillColor}
      strokeWidth={2}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
