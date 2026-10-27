import type { TileProps } from "../../types/gameboard.types";
import { useHover } from "../../hooks/useGameBoardHover";
import { axialToPixel, HEX_SIZE } from "../../../../../shared/game/hexCalculation";
import {
  getTileFillColor,
  getTileStrokeColor,
  getTileStrokeWidth
} from '../../utils/tileRendering';

const TOKEN_RADIUS = HEX_SIZE * 0.34;
const TOKEN_FONT_SIZE = HEX_SIZE * 0.46;

export const HexTile: React.FC<TileProps> = ({
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
    data.land,
    null,
    isSelected,
    effectiveIsHovered,
  );
  const strokeColor = getTileStrokeColor(effectiveIsHovered);
  const strokeWidth = getTileStrokeWidth(effectiveIsHovered);
  const { x: centerX, y: centerY } = axialToPixel(data.q, data.r, HEX_SIZE);
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle_rad = (Math.PI / 180) * (60 * i - 30);
    const x = centerX + HEX_SIZE * Math.cos(angle_rad);
    const y = centerY + HEX_SIZE * Math.sin(angle_rad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  const tokenValue = data.value;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => { e.stopPropagation(); onClick(data); }}
      style={{ cursor: 'pointer' }}
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {tokenValue != null && (
        <g pointerEvents="none" aria-hidden="true">
          <circle
            cx={centerX}
            cy={centerY}
            r={TOKEN_RADIUS}
            fill="#ffffff"
            stroke="#333333"
            strokeWidth={1}
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={TOKEN_FONT_SIZE}
            fontWeight="bold"
            fill="#222222"
          >
            {tokenValue}
          </text>
        </g>
      )}
    </g>
  );
};
