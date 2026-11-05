import type { CoastProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import {
  SAND_WIDTH,
  SAND_COLOR
} from "../../../../../shared/game/gameboard.types";

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
      {port && <PortIcon p1={p1} p2={p2} normal={normal} type={port.type} />}
    </g>
  );
};

interface PortIconProps {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  normal: { x: number; y: number };
  type: string;
}

const DOCK_COLOR = "#8b6e4b";
const DOCK_SHADOW = "#5a4630";

const PortIcon: React.FC<PortIconProps> = ({ p1, p2, normal }) => {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <g
      transform={`translate(${midX + normal.x * (SAND_WIDTH / 2)}, ${
        midY + normal.y * (SAND_WIDTH / 2)
      }) rotate(${(Math.atan2(normal.y, normal.x) * 180) / Math.PI})`}
      pointerEvents="none"
    >
      {/* platform in the sand */}
      <rect
        x={-2}
        y={-4}
        width={20}
        height={8}
        rx={1}
        fill={DOCK_COLOR}
        stroke={DOCK_SHADOW}
        strokeWidth={0.7}
      />
      {/* boards */}
      <line x1={0} y1={-4} x2={0} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      <line x1={5} y1={-4} x2={5} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
       <line x1={10} y1={-4} x2={10} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      <line x1={15} y1={-4} x2={15} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      {/* stilts on the seaside */}
      <line x1={21} y1={-2.5} x2={17.5} y2={-2.5} stroke={DOCK_SHADOW} strokeWidth={1.2} />
      <line x1={21} y1={2.5} x2={17.5} y2={2.5} stroke={DOCK_SHADOW} strokeWidth={1.2} />
    </g>
  );
};
