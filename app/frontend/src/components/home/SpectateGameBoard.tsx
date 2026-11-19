import type { GameBoard } from "shared";
import { ReserveIcon } from "../../game/components/gameboard/GameIcon";
import { WaterLayer } from "../../game/components/gameboard/Water";
import { Coast } from "../../game/components/gameboard/Coast";
import { HexTile } from "../../game/components/gameboard/HexTile";
import { Road } from "../../game/components/gameboard/Road";
import { Settlement } from "../../game/components/gameboard/Settlement";

export default function SpectateGameBoard({board}: { board: GameBoard}) {
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
        />
        <WaterLayer data={coasts} />
        {coasts.map((coast) => (
          <Coast
            key={coast.id}
            data={coast}
          />
        ))}
        {layout.map((tile) => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
          />
        ))}
        {roads.map((road) => (
          <Road
            key={`road-${road.id}`}
            data={road}
          />
        ))}
        {settlements.map((settlement) => (
          <Settlement
            key={`settlement-${settlement.id}`}
            data={settlement}
          />
        ))}
      </svg>
    </div>
  );
};
