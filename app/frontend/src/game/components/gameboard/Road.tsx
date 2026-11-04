import type { RoadProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import { getTileFillColor } from "../../utils/tileRendering";
import { ROAD_SIZE, HOVER_EFFECT } from "@shared/game/gameboard.types";

export const Road: React.FC<RoadProps> = ({
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
    <line
      x1={data.edge.p1.x}
      y1={data.edge.p1.y}
      x2={data.edge.p2.x}
      y2={data.edge.p2.y}
      stroke={fillColor}
      strokeWidth={effectiveIsHovered ? ROAD_SIZE * HOVER_EFFECT : ROAD_SIZE}
      strokeLinecap="round"
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
