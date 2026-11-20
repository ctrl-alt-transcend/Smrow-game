import { Table, Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { GameList } from "shared";
import SpectateGameBoard from "./SpectateGameBoard";
import { useJoinLobby } from "../../game/utils/game.utils.tsx";

const maxPlayers = 4;
type GameRowProps = {
  game: GameList;
};

export default function GameRow({ game }: GameRowProps) {
  const [spectateOpened, { open: openSpectate, close: closeSpectate }] =
    useDisclosure(false);

  const joinLobby = useJoinLobby();
  const isFull = game.playerCount >= maxPlayers;
  const gameStart = game.state !== "Pending Player";
  const variant = gameStart ? "default" : "filled";

  function spectateGame() {
    openSpectate();
  }

  function handleAction(gameStarted: boolean, gameId: string) {
    if (!gameStarted) {
      joinLobby(gameId);
    } else {
      return null; //TODO: add spectate functionality
    }
  }

  return (
    <>
      <Table.Tr>
        <Table.Td>{game.gameId.substring(0, 5)}</Table.Td>
        <Table.Td>
          {game.playerCount}/{maxPlayers}
        </Table.Td>
        <Table.Td>
          {gameStart ? "Game Started" : "Waiting for players"}
        </Table.Td>{" "}
        :
        <Table.Td>
          {gameStart ? (
            <Button variant={variant} miw={100} onClick={spectateGame}>
              Spectate
            </Button>
          ) : (
            <Button
              onClick={() => handleAction(gameStart, game.gameId)}
              disabled={isFull}
              variant={variant}
              miw={100}
            >
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
        <SpectateGameBoard gameId={game.gameId} />
      </Modal>
    </>
  );
}
