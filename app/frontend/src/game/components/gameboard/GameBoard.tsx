import { HexTile } from './HexTile'
import { Road } from './RoadTile'
import { Settlement } from './SettlementTile'
import { classicLayout, GameBoardProps } from '../../types/gameboard.types';

export const GameBoard: React.FC<GameBoardProps> = (props) => {
  const {
    boardData: { settlements, roads, svgBounds },
    selected,
    handleTileClick,
    handleRoadClick,
    handleSettlementClick,
    isTileHovered,
    isRoadHovered,
    isSettlementHovered,
    handleTileHover,
    handleRoadHover,
    handleSettlementHover
  } = props;

  return (
    <div style={{ width: '100%', maxWidth: svgBounds.svgWidth, margin: '0 auto' }}>
      <svg
        width={svgBounds.svgWidth}
        height={svgBounds.svgHeight}
        viewBox={`${svgBounds.offsetX} ${svgBounds.offsetY} ${svgBounds.svgWidth} ${svgBounds.svgHeight}`}
        style={{ border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}
      >
        {classicLayout.map(tile => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
            isSelected={selected.selectedTile?.q === tile.q && selected.selectedTile?.r === tile.r}
            isHovered={isTileHovered(tile)}
            onHoverChange={(isHovered) => handleTileHover(isHovered, tile)}
            onClick={handleTileClick}
          />
        ))}
        {roads.map(road => (
          <Road
            key={`road-${road.id}`}
            data={road}
            isSelected={selected.selectedRoad?.id === road.id}
            isHovered={isRoadHovered(road)}
            onHoverChange={(isHovered) => handleRoadHover(isHovered, road)}
            onClick={handleRoadClick}
          />
        ))}
        {settlements.map(settlement => (
          <Settlement
            key={`settlement-${settlement.id}`}
            data={settlement}
            isSelected={selected.selectedSettlement?.id === settlement.id}
            isHovered={isSettlementHovered(settlement)}
            onHoverChange={(isHovered) => handleSettlementHover(isHovered, settlement)}
            onClick={handleSettlementClick}
          />
        ))}
      </svg>
    </div>
  );
}

export default GameBoard;
