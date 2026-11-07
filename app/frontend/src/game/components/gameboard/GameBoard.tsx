import { HexTile } from "./HexTile";
import { Road } from "./Road";
import { Settlement } from "./Settlement";
import { Coast } from "./Coast";
import { WaterLayer } from "./Water";

import type { GameBoardProps } from "../../types/gameboard.types";
import { ReserveIcon } from "./GameIcon";

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selected,
  handleTileClick,
  handleRoadClick,
  handleCoastClick,
  handleSettlementClick,
  handleReserveClick,
  isTileHovered,
  isRoadHovered,
  isSettlementHovered,
  isCoastHovered,
  isReserveHovered,
  handleTileHover,
  handleRoadHover,
  handleSettlementHover,
  handleCoastHover,
  handleReserveHover
}) => {
  const { layout, roads, settlements, coasts, svgBounds } = board;

  return (
    <div
      style={{ width: "100%", maxWidth: svgBounds.svgWidth, margin: "0 auto" }}
    >
      <svg
        width={svgBounds.svgWidth}
        height={svgBounds.svgHeight}
        viewBox={`${svgBounds.offsetX} ${svgBounds.offsetY} ${svgBounds.svgWidth} ${svgBounds.svgHeight}`}
      >
        <ReserveIcon
          data={board.reserve}
          isSelected={selected.selectedReserve?.id === board.reserve.id}
          isHovered={isReserveHovered(board.reserve)}
          onHoverChange={(h) => handleReserveHover(h, board.reserve)}
          onClick={handleReserveClick}
        />
        <WaterLayer data={coasts}/>
        {coasts.map((coast) => (
          <Coast
            data={coast}
            isSelected={selected.selectedCoast?.id === coast.id}
            isHovered={isCoastHovered(coast)}
            onHoverChange={(isHovered) =>
              handleCoastHover(isHovered, coast)
            }
            onClick={handleCoastClick}
          />
        ))}
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
