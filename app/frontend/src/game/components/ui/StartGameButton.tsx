import { Button } from "@mantine/core";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";

export default function StartGameButton({ nPlayers }: { nPlayers: number }) {
  const sendStartGameRequest = () => {
    socket.emit("startGame");
  };

  return (
    <Button
      disabled={nPlayers < 2}
      variant="light"
      color="red"
      fullWidth
      onClick={sendStartGameRequest}
    >
      Start Da Game !
    </Button>
  );
}
