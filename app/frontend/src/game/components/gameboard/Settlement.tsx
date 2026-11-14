import type { SettlementProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import { getFillColor } from "../../utils/tileRendering";
import { GoblinSettlementIcon, GoblinCityIcon } from "./GameIcon";
import {
  VERTEX_SIZE,
  SETTLEMENT_SIZE,
  HOVER_EFFECT,
  ICON_SCALE_BASE,
} from "shared";

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
  const fillColor = getFillColor(
    null,
    data.faction,
    isSelected,
    effectiveIsHovered,
  );

  const isOwned = !!data.ownerId;

  if (!isOwned) {
    return (
      <circle
        cx={data.vertex.x}
        cy={data.vertex.y}
        r={effectiveIsHovered ? VERTEX_SIZE * HOVER_EFFECT : VERTEX_SIZE}
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
  }

  const scale = SETTLEMENT_SIZE / ICON_SCALE_BASE;

  return (
    <g
      transform={`translate(${data.vertex.x}, ${data.vertex.y}) scale(${scale})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* invisible click area */}
      <circle r={16 / scale} fill="transparent" />

      {data.isCity ? (
        <GoblinCityIcon flagColor={fillColor ?? "#b0b0b0"} />
      ) : (
        <GoblinSettlementIcon flagColor={fillColor ?? "#b0b0b0"} />
      )}
    </g>
  );
};
