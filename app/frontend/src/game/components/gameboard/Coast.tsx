import type { CoastProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import { PortIcon } from "./GameIcon";
import {
  SAND_WIDTH,
  SAND_COLOR,
  SPECIALIZED_PORT_COLOR,
  NORMAL_PORT_COLOR,
} from "shared";

export const Coast: React.FC<CoastProps> = ({
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

  const { edge, normal, port } = data;
  const { p1, p2 } = edge;

  const extend = 4;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  const sandCenter = {
    x: (p1.x + p2.x) / 2 + normal.x * (SAND_WIDTH / 2),
    y: (p1.y + p2.y) / 2 + normal.y * (SAND_WIDTH / 2),
  };
  const highlightColor = isSelected ? "#ffd700" : "#ffffff";
  let color: string;
  if (data.port && data.port.type === "generic") {
    color = NORMAL_PORT_COLOR;
  } else {
    color = SPECIALIZED_PORT_COLOR;
  }

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: "pointer" }}
    >
      <line
        x1={sandCenter.x - ux * (len / 2 + extend)}
        y1={sandCenter.y - uy * (len / 2 + extend)}
        x2={sandCenter.x + ux * (len / 2 + extend)}
        y2={sandCenter.y + uy * (len / 2 + extend)}
        stroke={SAND_COLOR}
        strokeWidth={SAND_WIDTH}
        strokeLinecap="round"
      />
      {(isSelected || effectiveIsHovered) && (
        <line
          x1={sandCenter.x - ux * (len / 2 + extend)}
          y1={sandCenter.y - uy * (len / 2 + extend)}
          x2={sandCenter.x + ux * (len / 2 + extend)}
          y2={sandCenter.y + uy * (len / 2 + extend)}
          stroke={highlightColor}
          strokeWidth={SAND_WIDTH}
          strokeLinecap="round"
          opacity={isSelected ? 0.35 : 0.25}
          strokeDasharray={isSelected ? undefined : "10,6"}
          pointerEvents="none"
          className="coast-highlight"
        />
      )}

      {port && <PortIcon p1={p1} p2={p2} normal={normal} flagColor={color} />}
    </g>
  );
};
