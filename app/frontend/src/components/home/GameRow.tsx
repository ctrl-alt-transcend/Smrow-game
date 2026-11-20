import { Table, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { GameList } from "shared";
import SpectateGameBoard from "./SpectateGameBoard";

type GameRowProps = {
  game: GameList;
};

const maxPlayers = 4;

export default function GameRow({ game }: GameRowProps) {
  const [spectateOpened, { open: openSpectate, close: closeSpectate }] =
    useDisclosure(false);

  const isFull = game.playerCount >= maxPlayers;
  const gameStart = game.state !== "pending";
  const variant = gameStart ? "default" : "filled";

  function spectateGame() {
    openSpectate();
  }

  return (
    <>
      <Table.Tr>
        <Table.Td>{game.gameId.substring(0, 5)}</Table.Td>
        <Table.Td>
          {game.playerCount}/{maxPlayers}
        </Table.Td>
          <Table.Td>{gameStart ? "Game Started" : "Waiting for players"}</Table.Td> :
        <Table.Td>
          {gameStart ? (
            <Button variant={variant} miw={100} onClick={spectateGame}>
              Spectate
            </Button>
          ) : (
            <Button disabled={isFull} variant={variant} miw={100}>
              Join
            </Button>
          )}
        </Table.Td>
      </Table.Tr>

      <Modal
        opened={spectateOpened}
        onClose={closeSpectate}
        title={`Spectating game #${game.gameId.substring(0, 5)}`}
        size="xl"
      >
      <SpectateGameBoard gameId={game.gameId}/>
      </Modal>
    </>
  );
}
