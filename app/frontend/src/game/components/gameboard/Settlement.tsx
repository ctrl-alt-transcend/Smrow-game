import type { SettlementProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import { getTileFillColor } from "../../utils/tileRendering";
import { SETTLEMENT_SIZE, HOVER_EFFECT } from "shared";

export const Settlement: React.FC<SettlementProps> = ({
  data,
  isSelected,
  isHovered,
  onHoverChange,
  onClick,
}) => {
  const {
    isHovered: effectiveIsHovered,
    onMouseEnter,
    onMouseLeave,
  } = useHover(isHovered, onHoverChange);
  const fillColor = getTileFillColor(
    null,
    data.faction,
    isSelected,
    effectiveIsHovered,
  );

  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={effectiveIsHovered ? SETTLEMENT_SIZE * HOVER_EFFECT : SETTLEMENT_SIZE}
      fill={fillColor}
      strokeWidth={2}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: "pointer" }}
    />
  );
};
