import { RoadData } from "../../types/gameboard.types";

interface RoadProps {
  data: RoadData;
  isSelected: boolean;
  hasOwner?: boolean;
  onClick: (data: RoadData) => void;
}

export const Road: React.FC<RoadProps> = ({ data, isSelected, hasOwner, onClick }) => {
  return (
    <line
      x1={data.edge.p1.x}
      y1={data.edge.p1.y}
      x2={data.edge.p2.x}
      y2={data.edge.p2.y}
      stroke={hasOwner ? '#c41e3a' : (isSelected ? '#ff6b6b' : '#888888')}
      strokeWidth={isSelected ? 5 : 4}
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
