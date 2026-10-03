import type { SettlementData } from "../../types/gameboard.types";

interface SettlementProps {
  data: SettlementData;
  isSelected: boolean;
  hasOwner?: boolean;
  onClick: (data: SettlementData) => void;
}

export const Settlement: React.FC<SettlementProps> = ({ data, isSelected, hasOwner, onClick }) => {
  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={isSelected ? 8 : 6}
      fill={hasOwner ? '#ffd700' : (isSelected ? '#ffcc00' : '#cccccc')}
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
