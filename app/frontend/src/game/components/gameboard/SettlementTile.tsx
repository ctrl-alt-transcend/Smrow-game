import { SettlementProps } from '../../types/gameboard.types';
import { useHover } from '../../hooks/useGameBoardHover';

export const Settlement: React.FC<SettlementProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);

  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={effectiveIsHovered ? 12 : 10}
      fill={isSelected ? '#ff6b6b' : effectiveIsHovered ? '#ffa500' : (data.hasOwner ? '#77c41e' : '#c0a030')}
      strokeWidth={2}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
