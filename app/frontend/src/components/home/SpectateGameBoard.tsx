import { WaterLayer } from "../../game/components/gameboard/Water";
import { Coast } from "../../game/components/gameboard/Coast";
import { HexTile } from "../../game/components/gameboard/HexTile";
import { Road } from "../../game/components/gameboard/Road";
import { Settlement } from "../../game/components/gameboard/Settlement";
import { useSpectateGameBoard } from "./useSpectateGameBoard"
import { Group, Stack } from "@mantine/core";
import GameMasterLogs from "../../game/components/ui/GameMasterLog";
import { ResourcesPanel } from "../../game/components/ui/ResourcesPanel";

export default function SpectateGameBoard({gameId}: {gameId: string}) {
  const { game } = useSpectateGameBoard(gameId);
  if (!game) return <div>Loading game...</div>;
  if (!game.board) return <div>Loading gameboard...</div>;
  const { layout, roads, settlements, coasts, svgBounds } = game.board;
  return (
    <Group justify="center">
      <Stack gap={0} justify="center" h="100%">
        <GameMasterLogs log={game.masterLog}/>
        <div
          style={{ width: "100%", maxWidth: svgBounds.svgWidth, margin: "0 auto" }}
        >
          <svg
            width={svgBounds.svgWidth}
            height={svgBounds.svgHeight}
            viewBox={`${svgBounds.offsetX} ${svgBounds.offsetY} ${svgBounds.svgWidth} ${svgBounds.svgHeight}`}
          >
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
      </Stack>
    </Group>
  );
};
