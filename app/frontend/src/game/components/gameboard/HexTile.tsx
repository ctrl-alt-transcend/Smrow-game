import { TileData, HEX_SIZE } from '../../types/gameboard.types';
import { axialToPixel } from '../../utils/hexRendering'

interface HexTileProps {
  data: TileData;
  isSelected: boolean;
  onClick: (data: TileData) => void;
}

export const HexTile: React.FC<HexTileProps> = ({ data, isSelected, onClick }) => {
  const { x: centerX, y: centerY } = axialToPixel(data.q, data.r, HEX_SIZE);
  const hexRadius = HEX_SIZE;

  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + hexRadius * Math.cos(angle_rad);
    const y = centerY + hexRadius * Math.sin(angle_rad);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={isSelected ? '#fffacd' : '#e0e0e0'}
      stroke="#444"
      strokeWidth="2"
      onClick={() => onClick(data)}
      style={{ cursor: 'pointer' }}
      data-type="tile"
      data-q={data.q}
      data-r={data.r}
    />
  );
};
