import { HexTile } from "./HexTile";
import { Road } from "./Road";
import { Settlement } from "./Settlement";
import { useGameBoard } from "../../contexts/GameBoardContext";
import type { GameBoardProps } from "../../types/gameboard.types";

export const GameBoard: React.FC<GameBoardProps> = ({
  layout,
  selected,
  handleTileClick,
  handleRoadClick,
  handleSettlementClick,
  isTileHovered,
  isRoadHovered,
  isSettlementHovered,
  handleTileHover,
  handleRoadHover,
  handleSettlementHover,
}) => {
  const { gameboard } = useGameBoard();
  const { roads, settlements, svgBounds } = gameboard;

  return (
    <div
      style={{ width: "100%", maxWidth: svgBounds.svgWidth, margin: "0 auto" }}
    >
      <svg
        width={svgBounds.svgWidth}
        height={svgBounds.svgHeight}
        viewBox={`${svgBounds.offsetX} ${svgBounds.offsetY} ${svgBounds.svgWidth} ${svgBounds.svgHeight}`}
      >
        {layout.map((tile) => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
            isSelected={
              selected.selectedTile?.q === tile.q &&
              selected.selectedTile?.r === tile.r
            }
            isHovered={isTileHovered(tile)}
            onHoverChange={(isHovered) => handleTileHover(isHovered, tile)}
            onClick={handleTileClick}
          />
        ))}
        {roads.map((road) => (
          <Road
            key={`road-${road.id}`}
            data={road}
            isSelected={selected.selectedRoad?.id === road.id}
            isHovered={isRoadHovered(road)}
            onHoverChange={(isHovered) => handleRoadHover(isHovered, road)}
            onClick={handleRoadClick}
          />
        ))}
        {settlements.map((settlement) => (
          <Settlement
            key={`settlement-${settlement.id}`}
            data={settlement}
            isSelected={selected.selectedSettlement?.id === settlement.id}
            isHovered={isSettlementHovered(settlement)}
            onHoverChange={(isHovered) =>
              handleSettlementHover(isHovered, settlement)
            }
            onClick={handleSettlementClick}
          />
        ))}
      </svg>
    </div>
  );
};

export default GameBoard;
