import { useHover } from "../../hooks/useGameBoardHover";
import { HOVER_COLOR, SAND_WIDTH } from "shared";
import type { ReserveProps } from "../../types/gameboard.types";
import trader from "../../assets/trader.svg";
import settlement from "../../assets/settlement.svg";
import city from "../../assets/city.svg";

interface ReserveIconArtProps {
  highlighted: boolean;
  x: number;
  y: number;
}

const ReserveIconArt: React.FC<ReserveIconArtProps> = ({
  highlighted,
  x,
  y,
}) => (
  <g strokeWidth={1.6} strokeLinejoin="round">
    <image
      href={trader}
      x={x - 65}
      y={y - 60}
      width={180}
      height={150}
      style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
    />

    {highlighted && (
      <circle
        cx={x + 20}
        cy={y + 30}
        r={60}
        fill="none"
        stroke={HOVER_COLOR}
        strokeWidth={2.5}
        strokeDasharray="6,4"
        opacity={0.8}
        pointerEvents="none"
      />
    )}
  </g>
);

export const ReserveIcon: React.FC<ReserveProps> = ({
  data,
  isSelected = false,
  isHovered,
  onHoverChange,
  onClick,
}) => {
  const {
    isHovered: effectiveIsHovered,
    onMouseEnter,
    onMouseLeave,
  } = useHover(isHovered, onHoverChange);

  return (
    <g
      transform={`translate(${data.position.x}, ${data.position.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(data);
      }}
      style={{ cursor: "pointer" }}
    >
      <circle r={38} fill="transparent" x={-30} y={20} />
      <ReserveIconArt
        highlighted={isSelected || effectiveIsHovered}
        x={-35}
        y={-10}
      />
    </g>
  );
};

interface GoblinIconProps {
  flagColor: string;
}

const GroundBaseShadow: React.FC<{ x: number; y: number; radius: number }> = ({
  x,
  y,
  radius,
}) => <ellipse cx={x} cy={y} rx={radius} ry={8} fill={SHADOW} opacity={0.6} />;

export const GoblinSettlementIcon: React.FC<GoblinIconProps> = ({
  flagColor,
}) => (
  <g>
    <GroundBaseShadow x={-0.2} y={6} radius={19} />
    <FactionFlag x={6.5} y={-18} flagColor={flagColor} />
    <image
      href={settlement}
      x={-38}
      y={-34}
      width={75}
      height={60}
      style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
    />
  </g>
);

export const GoblinCityIcon: React.FC<GoblinIconProps> = ({ flagColor }) => (
  <g>
    <GroundBaseShadow x={0.2} y={8} radius={21} />
    <FactionFlag x={10.5} y={-14} flagColor={flagColor} />
    <image
      href={city}
      x={-40}
      y={-36}
      width={80}
      height={65}
      style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
    />
  </g>
);

const DOCK_COLOR = "#8b6e4b";
const DOCK_SHADOW = "#5a4630";
const SHADOW = "rgba(0, 0, 0, 0.35)";
const FLAG_POLE = "#3d2a15";

/** flag */
export const FactionFlag: React.FC<{
  flagColor: string;
  x: number;
  y: number;
}> = ({ flagColor, x, y }) => (
  <g>
    {/* mast */}
    <line
      x1={x}
      y1={y}
      x2={x}
      y2={y + 10}
      stroke={FLAG_POLE}
      strokeWidth={1.2}
    />
    {/* knob */}
    <circle
      cx={x}
      cy={y}
      r={1.2}
      fill="#8b6e4b"
      stroke="#3d2a15"
      strokeWidth={0.5}
    />
    {/* fanion */}
    <polygon
      points={`${x},${y + 1} ${x + 9},${y + 3} ${x},${y + 5.5}`}
      fill={flagColor}
      stroke="#1a1a1a"
      strokeWidth={0.7}
    />
  </g>
);

interface PortIconProps {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  normal: { x: number; y: number };
  flagColor: string;
}

export const PortIcon: React.FC<PortIconProps> = ({
  p1,
  p2,
  normal,
  flagColor,
}) => {
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
      <line
        x1={0}
        y1={-4}
        x2={0}
        y2={4}
        stroke={DOCK_SHADOW}
        strokeWidth={0.5}
        opacity={0.6}
      />
      <line
        x1={5}
        y1={-4}
        x2={5}
        y2={4}
        stroke={DOCK_SHADOW}
        strokeWidth={0.5}
        opacity={0.6}
      />
      <line
        x1={10}
        y1={-4}
        x2={10}
        y2={4}
        stroke={DOCK_SHADOW}
        strokeWidth={0.5}
        opacity={0.6}
      />
      <line
        x1={15}
        y1={-4}
        x2={15}
        y2={4}
        stroke={DOCK_SHADOW}
        strokeWidth={0.5}
        opacity={0.6}
      />
      {/* stilts on the seaside */}
      <line
        x1={21}
        y1={-2.5}
        x2={17.5}
        y2={-2.5}
        stroke={DOCK_SHADOW}
        strokeWidth={1.2}
      />
      <line
        x1={21}
        y1={2.5}
        x2={17.5}
        y2={2.5}
        stroke={DOCK_SHADOW}
        strokeWidth={1.2}
      />
      <FactionFlag flagColor={flagColor} x={14} y={-12} />
    </g>
  );
};
