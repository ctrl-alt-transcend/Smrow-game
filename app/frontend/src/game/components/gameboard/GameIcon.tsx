import { useHover } from "../../hooks/useGameBoardHover";
import { SAND_WIDTH } from "../../../../../shared/game/gameboard.types";
import type { ReserveProps } from "../../types/gameboard.types";

/**
 * Reserve icon: goblin elder head with a green hood, drawn in the same flat
 * vector style as the settlements/cities. Rendered INSIDE the GameBoard SVG,
 * anchored in the empty top-left margin area (see svgBounds adjustments in
 * initGameBoard).
 *
 * Clicking it opens the 4:1 bank trade (logic handled by the parent through
 * onClick). Hover/select highlight = subtle outline around the hood.
 */

const HOOD_MAIN = "#8faf5a";
const HOOD_DARK = "#6b8a3f";
const HOOD_SEAM = "#4e6b2a";
const SKIN = "#ecd9a8";
const SKIN_SHADE = "#d9bf85";
const STUBBLE = "#6b4f33";
const OUTLINE = "#3d2a15";

interface ReserveIconArtProps {
  /** true → subtle glow outline (selection feedback) */
  highlighted: boolean;
}

/** Pure SVG art of the goblin head, drawn in a ~[-34..34] × [-34..34] box */
const ReserveIconArt: React.FC<ReserveIconArtProps> = ({ highlighted }) => (
  <g stroke={OUTLINE} strokeWidth={1.6} strokeLinejoin="round">
    {/* pointed ears (behind the face) */}
    <path d="M-26,-2 L-36,6 L-24,10 Z" fill={SKIN} />
    <path d="M26,-2 L36,6 L24,10 Z" fill={SKIN} />

    {/* face (big rounded shape under the hood) */}
    <path
      d="M-24,-6 C-26,10 -18,24 0,26 C18,24 26,10 24,-6 Z"
      fill={SKIN}
    />
    {/* cheek shading */}
    <path
      d="M-22,4 C-20,16 -12,22 -2,24 C-14,22 -20,14 -22,4 Z"
      fill={SKIN_SHADE}
      stroke="none"
      opacity={0.7}
    />

    {/* beard stubble around the jaw */}
    <path
      d="M-20,14 C-16,26 -8,28 0,28 C8,28 16,26 20,14 C14,22 6,24 0,24 C-6,24 -14,22 -20,14 Z"
      fill={STUBBLE}
      strokeWidth={1}
    />

    {/* hood: big drooping shape covering the top and sides */}
    <path
      d="M-30,4 C-32,-14 -22,-32 0,-32 C22,-32 32,-14 30,4 C28,10 22,10 20,4 C18,-10 12,-18 0,-18 C-12,-18 -18,-10 -20,4 C-22,10 -28,10 -30,4 Z"
      fill={HOOD_MAIN}
    />
    {/* hood inner rim (between hood and forehead) */}
    <path
      d="M-20,4 C-18,-10 -12,-18 0,-18 C12,-18 18,-10 20,4 C16,-4 10,-9 0,-9 C-10,-9 -16,-4 -20,4 Z"
      fill={HOOD_DARK}
      strokeWidth={1.2}
    />
    {/* hood seam stitches */}
    <path d="M-8,-30 C-4,-26 4,-26 8,-30" fill="none" stroke={HOOD_SEAM} strokeWidth={1.4} />
    <line x1={0} y1={-30} x2={0} y2={-26} stroke={HOOD_SEAM} strokeWidth={1.4} />
    <line x1={-22} y1={-20} x2={-18} y2={-17} stroke={HOOD_SEAM} strokeWidth={1.4} />
    <line x1={22} y1={-20} x2={18} y2={-17} stroke={HOOD_SEAM} strokeWidth={1.4} />

    {/* heavy eyelids + eyes (wide apart, sly look) */}
    <path d="M-16,-1 C-14,-4 -6,-4 -5,-1" fill="none" strokeWidth={1.8} />
    <path d="M16,-1 C14,-4 6,-4 5,-1" fill="none" strokeWidth={1.8} />
    <ellipse cx={-10.5} cy={-1} rx={3.4} ry={2.4} fill="#ffffff" strokeWidth={1} />
    <ellipse cx={10.5} cy={-1} rx={3.4} ry={2.4} fill="#ffffff" strokeWidth={1} />
    <circle cx={-9.8} cy={-0.6} r={1.3} fill={OUTLINE} stroke="none" />
    <circle cx={11.2} cy={-0.6} r={1.3} fill={OUTLINE} stroke="none" />

    {/* eyebrows lost under the hood rim */}
    <line x1={-15} y1={-5} x2={-6} y2={-5.5} stroke={HOOD_SEAM} strokeWidth={1.2} />
    <line x1={15} y1={-5} x2={6} y2={-5.5} stroke={HOOD_SEAM} strokeWidth={1.2} />

    {/* big nose */}
    <path d="M-4,2 C-6,8 -5,12 0,13 C5,12 6,8 4,2 C2,0 -2,0 -4,2 Z" fill={SKIN_SHADE} />

    {/* smug smile */}
    <path d="M-8,17 C-4,21 4,21 8,17" fill="none" strokeWidth={1.8} />
    <path d="M-8,17 C-6,18 -4,18 -3,17" fill="none" strokeWidth={1.2} />

    {/* cheek wrinkles */}
    <line x1={-16} y1={8} x2={-12} y2={9} stroke={SKIN_SHADE} strokeWidth={1.2} />
    <line x1={16} y1={8} x2={12} y2={9} stroke={SKIN_SHADE} strokeWidth={1.2} />

    {/* selection glow (outside the shapes, traced roughly around the head) */}
    {highlighted && (
      <circle
        cx={0}
        cy={-2}
        r={36}
        fill="none"
        stroke="#ffd700"
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

  return (
    <g
      transform={`translate(${data.position.x}, ${data.position.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* invisible generous hit area */}
      <circle r={38} fill="transparent" />
      <ReserveIconArt highlighted={isSelected || effectiveIsHovered} />
    </g>
  );
};

const DOCK_COLOR = "#8b6e4b";
const DOCK_SHADOW = "#5a4630";
const LOG_DARK = "#6b4a2b";
const LOG_LIGHT = "#7d5834";
const BEAM = "#4a3018";
const PLASTER = "#cfa878";
const ROOF = "#8a5a33";
const STONE = "#8f8f94";
const STONE_DARK = "#6e6e73";
const SHADOW = "rgba(0, 0, 0, 0.35)";
const FLAG_POLE = "#3d2a15";

interface GoblinIconProps {
  flagColor: string;
}

/** flag */
export const FactionFlag: React.FC<{ flagColor:string, x: number; y: number }> = ({
  flagColor,
  x,
  y,
}) => (
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
    <circle cx={x} cy={y} r={1.2} fill="#8b6e4b" stroke="#3d2a15" strokeWidth={0.5} />
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
      <line x1={0} y1={-4} x2={0} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      <line x1={5} y1={-4} x2={5} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      <line x1={10} y1={-4} x2={10} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      <line x1={15} y1={-4} x2={15} y2={4} stroke={DOCK_SHADOW} strokeWidth={0.5} opacity={0.6} />
      {/* stilts on the seaside */}
      <line x1={21} y1={-2.5} x2={17.5} y2={-2.5} stroke={DOCK_SHADOW} strokeWidth={1.2} />
      <line x1={21} y1={2.5} x2={17.5} y2={2.5} stroke={DOCK_SHADOW} strokeWidth={1.2} />
      <FactionFlag flagColor={flagColor} x={14} y={-12} />
    </g>
  );
};

const GroundBaseShadow: React.FC<{ x: number; y: number; radius: number }> = ({
  x,
  y,
  radius,
}) => (
  <ellipse cx={x} cy={y} rx={radius} ry={2.8} fill={SHADOW} opacity={0.6} />
);

const SpikeBarricade: React.FC<{ x: number; groundY: number }> = ({
  x,
  groundY,
}) => {
  const logs: [number, number][] = [
    [0, 7],
    [3, 9],
    [6, 6.5],
    [9, 8.5],
    [12, 7],
  ];
  return (
    <g>
      {logs.map(([ox, h], i) => {
        const baseX = x + ox;
        const tipY = groundY - h;
        const bodyTop = groundY - h + 2.5;
        return (
          <path
            key={i}
            d={`M${baseX},${groundY} V${bodyTop} L${baseX + 1.4},${tipY} L${baseX + 2.8},${bodyTop} V${groundY} Z`}
            fill={i % 2 === 0 ? LOG_DARK : LOG_LIGHT}
            stroke="#3d2a15"
            strokeWidth={0.5}
          />
        );
      })}
      <rect
        x={x - 1}
        y={groundY - 4}
        width={14.5}
        height={2}
        fill="#5a3a21"
        stroke="#3d2a15"
        strokeWidth={0.5}
      />
    </g>
  );
};

const SmallHut: React.FC<{ x: number; groundY: number }> = ({
  x,
  groundY,
}) => (
  <g>
    <rect
      x={x - 3}
      y={groundY - 6}
      width={7}
      height={6}
      fill={PLASTER}
      stroke={BEAM}
      strokeWidth={0.6}
    />
    <polygon
      points={`${x - 5},${groundY - 4} ${x + 0.5},${groundY - 10} ${x + 6},${groundY - 4}`}
      fill={ROOF}
      stroke={BEAM}
      strokeWidth={0.8}
    />
    <rect x={x + 0.5} y={groundY - 3} width={2.5} height={3} fill="#2a1a0a" />
  </g>
);

export const GoblinSettlementIcon: React.FC<GoblinIconProps> = ({
  flagColor,
}) => (
  <g>
    <FactionFlag x={-4} y={-17} flagColor={flagColor} />
    <GroundBaseShadow x={0} y={9.5} radius={19} />
    <rect
      x={-9}
      y={-2}
      width={10}
      height={9}
      fill={PLASTER}
      stroke={BEAM}
      strokeWidth={0.8}
    />
    <line
      x1={-6}
      y1={-2}
      x2={-6}
      y2={7}
      stroke={BEAM}
      strokeWidth={1}
    />
    <line
      x1={-2.5}
      y1={-2}
      x2={-2.5}
      y2={7}
      stroke={BEAM}
      strokeWidth={1}
    />
    <line
      x1={-9}
      y1={2.5}
      x2={1}
      y2={2.5}
      stroke={BEAM}
      strokeWidth={0.8}
    />
    <line
      x1={-6}
      y1={2.5}
      x2={-2.5}
      y2={-2}
      stroke={BEAM}
      strokeWidth={0.8}
    />
    <polygon
      points="-11,-2 -4,-10 3,-2"
      fill={ROOF}
      stroke={BEAM}
      strokeWidth={0.8}
    />
    <rect x={-4.5} y={2.5} width={4} height={4.5} fill="#3a2510" />
    <rect x={-1.5} y={-7} width={2} height={4} fill="#6b4a2b" stroke="#3d2a15" strokeWidth={0.5} />
    <SmallHut x={-13} groundY={9} />
    <SmallHut x={11} groundY={9} />
    <SpikeBarricade x={-2} groundY={12} />

  </g>
);

const RusticStoneWall: React.FC<{ x: number; groundY: number; width: number }> = ({
  x,
  groundY,
  width,
}) => {
  const merlons = [0, 1, 3, 4, 6, 7, 9];
  const merlonW = width / 10;
  return (
    <g>
      <rect
        x={x}
        y={groundY - 6}
        width={width}
        height={6}
        fill={STONE}
        stroke={STONE_DARK}
        strokeWidth={0.6}
      />
      {merlons.map((m) => (
        <rect
          key={m}
          x={x + m * merlonW + (m % 2 === 0 ? 0 : 0.4)}
          y={groundY - 8}
          width={merlonW * 0.7}
          height={2}
          fill={STONE}
          stroke={STONE_DARK}
          strokeWidth={0.6}
        />
      ))}
      <line
        x1={x}
        y1={groundY - 3.5}
        x2={x + width}
        y2={groundY - 3.5}
        stroke={STONE_DARK}
        strokeWidth={0.5}
        opacity={0.7}
      />
      <line
        x1={x + width * 0.3}
        y1={groundY - 6}
        x2={x + width * 0.3}
        y2={groundY - 3.5}
        stroke={STONE_DARK}
        strokeWidth={0.5}
        opacity={0.7}
      />
      <line
        x1={x + width * 0.65}
        y1={groundY - 3.5}
        x2={x + width * 0.65}
        y2={groundY}
        stroke={STONE_DARK}
        strokeWidth={0.5}
        opacity={0.7}
      />
    </g>
  );
};

export const GoblinCityIcon: React.FC<GoblinIconProps> = ({ flagColor }) => (
  <g>
    <GroundBaseShadow x={0} y={11} radius={20} />
    <FactionFlag x={0} y={-24} flagColor={flagColor} />
    {/* main body */}
    <rect x={-7} y={-6} width={14} height={16} fill={PLASTER} stroke={BEAM} strokeWidth={0.8} />
    {/* side wings with thatched/wooden roofs */}
    <rect x={-14} y={-1} width={7} height={10} fill={PLASTER} stroke={BEAM} strokeWidth={0.8} />
    <polygon points="-14.5,-1 -10.5,-6 -6.5,-1" fill={ROOF} stroke={BEAM} strokeWidth={0.8} />
    <rect x={7} y={-1} width={7} height={10} fill={PLASTER} stroke={BEAM} strokeWidth={0.8} />
    <polygon points="6.5,-1 10.5,-6 14.5,-1" fill={ROOF} stroke={BEAM} strokeWidth={0.8} />

    {/* dome at the top */}
    <path d="M-7,-6 A7,7 0 0 1 7,-6 Z" fill="#9aa0a6" stroke={STONE_DARK} strokeWidth={0.8} />
    {/* dome ribs */}
    <line x1={0} y1={-13} x2={0} y2={-6} stroke={STONE_DARK} strokeWidth={0.6} opacity={0.8} />
    <line x1={-4} y1={-11.5} x2={-2.5} y2={-6} stroke={STONE_DARK} strokeWidth={0.6} opacity={0.8} />
    <line x1={4} y1={-11.5} x2={2.5} y2={-6} stroke={STONE_DARK} strokeWidth={0.6} opacity={0.8} />
    {/* lantern at the top of the dome */}
    <rect x={-1.5} y={-15.5} width={3} height={3} fill={STONE} stroke={STONE_DARK} strokeWidth={0.6} />
    <polygon points="-1.5,-15.5 0,-17.5 1.5,-15.5" fill={ROOF} stroke={BEAM} strokeWidth={0.6} />

    {/* black arched door */}
    <path d="M-3.5,10 V5 A3.5,3.5 0 0 1 3.5,5 V10 Z" fill="#1e1410" />

    {/* rustic stone wall in front */}
    <RusticStoneWall x={-17} groundY={11} width={12} />
    <RusticStoneWall x={5} groundY={11} width={12} />
  </g>
);
