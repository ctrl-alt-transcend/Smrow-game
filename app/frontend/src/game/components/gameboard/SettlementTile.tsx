import { SettlementProps } from '../../types/shared.types';
import { useHover } from '../../hooks/useHover';

export const Settlement: React.FC<SettlementProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick,
  hasOwner
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);

  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={effectiveIsHovered ? 12 : 10}
      fill={isSelected ? '#ff6b6b' : effectiveIsHovered ? '#ffa500' : (hasOwner ? '#77c41e' : '#c0a030')}
      strokeWidth={2}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
