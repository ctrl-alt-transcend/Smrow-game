import { Table, Button } from "@mantine/core";
import type { GameList } from "@shared/game/game.types";

type GameRowProps = {
  game: GameList;
};

const maxPlayers = 4;

export default function GameRow({ game }: GameRowProps) {
  const isFull = game.playerCount >= maxPlayers;
  const gameStart = game.state !== "waiting for players";
  const variant = !gameStart ? "default" : "filled";

  return (
    <Table.Tr>
      <Table.Td>{game.gameId.substring(0, 5)}</Table.Td>
      <Table.Td>
        {game.playerCount}/{maxPlayers}
      </Table.Td>
      <Table.Td>{!gameStart ? "Game Started" : "Waiting for players"}</Table.Td>
      <Table.Td>
        <Button disabled={gameStart && isFull} variant={variant} miw={100}>
          {!gameStart ? "Spectate" : "Join"}
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}
