import { RoadProps } from '../../types/gameboard.types';
import { useHover } from '../../hooks/useGameBoardHover';

export const Road: React.FC<RoadProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick
}) => {
  const { isHovered: effectiveIsHovered, onMouseEnter, onMouseLeave } = useHover(isHovered, onHoverChange);

  return (
    <line
      x1={data.edge.p1.x}
      y1={data.edge.p1.y}
      x2={data.edge.p2.x}
      y2={data.edge.p2.y}
      stroke={isSelected ? '#ff0000' : effectiveIsHovered ? '#cc0000' : (data.hasOwner ? '#77c41e' : '#6be4ff')}
      strokeWidth={isSelected ? 8 : 6}
      strokeLinecap="round"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    />
  );
};
