import type { CoastData } from "@shared/game/gameboard.types"
import {
  WATER_WIDTH,
  WATER_COLOR,
  WATER_OPACITY
} from "../../../../../shared/game/gameboard.types";

export const Water: React.FC<{ data: CoastData }> = ({ data }) => {
  const { edge, normal } = data;
  const { p1, p2 } = edge;

  const extend = 11;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const halfLen = len / 2 + extend;

  const cx = (p1.x + p2.x) / 2 + normal.x * (WATER_WIDTH / 2);
  const cy = (p1.y + p2.y) / 2 + normal.y * (WATER_WIDTH / 2);

  return (
    <line
      x1={cx - ux * halfLen}
      y1={cy - uy * halfLen}
      x2={cx + ux * halfLen}
      y2={cy + uy * halfLen}
      stroke={WATER_COLOR}
      strokeWidth={WATER_WIDTH}
      strokeLinecap="round"
      opacity={WATER_OPACITY}
      pointerEvents="none"
    />
  );
};

export const WaterLayer: React.FC<{ data: CoastData[] }> = ({ data }) => (
  <>
    {data.map((coast) => (
      <Water key={`water-${coast.id}`} data={coast} />
    ))}
  </>
);
