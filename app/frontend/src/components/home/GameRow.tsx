//import type { Game } from "../../mocks/games.mock";
import { Table, Button } from "@mantine/core";
import type {GameDataDto} from "@shared/game/game.types";

// type GameRowProps = {
//   game: Game;
// };
type GameRowProps = {
  game: GameDataDto;
};


export default function GameRow({ game }: GameRowProps) {
  // const isFull = game.players.length >= game.maxPlayers;
  const isFull = game.players.length >= 4;
  // const isPlaying = "playing";
  const isPlaying = false;
  const variant = isPlaying ? "default" : "filled";

  return (
    <Table.Tr>
      <Table.Td>{game.gameId.slice(0, 4)}</Table.Td>
      <Table.Td>
        {game.players.length}/4
        {/* {game.players.length}/{game.maxPlayers} */}
      </Table.Td>
        <Table.Td>Waiting for players...</Table.Td>
      {/* <Table.Td>{game.status}</Table.Td> */}
      <Table.Td>
        <Button disabled={!isPlaying && isFull} variant={variant} miw={100}>
          {isPlaying ? "Spectate" : "Join"}
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}
