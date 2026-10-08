import { HexTile } from './HexTile'
import { Road } from './RoadTile'
import { Settlement } from './SettlementTile'
import { classicLayout } from '../../types/gameboard.types';
import { useGameBoardData } from '../../hooks/useGameBoardData';
import { useGameBoardHover } from '../../hooks/useGameBoardHover';
import { useGameBoardSelection } from '../../hooks/useGameBoardSelection';
import { SelectionInfo } from '../ui/SelectionInfo';

function GameBoard() {
  const {
    settlements,
    roads,
    svgBounds } =
    useGameBoardData(classicLayout)
  const {
    selected,
    handleTileClick,
    handleSettlementClick,
    handleRoadClick } =
    useGameBoardSelection();
  const {
    isTileHovered,
    isRoadHovered,
    isSettlementHovered,
    handleTileHover,
    handleRoadHover,
    handleSettlementHover } =
    useGameBoardHover();

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
      <SelectionInfo selected={selected} />
    </div>
  );
}

export default GameBoard;
