import { Button } from "@mantine/core";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";

export default function StartGameButton() {
  const sendStartGameRequest = () => {
    socket.emit("startGame");
  };

  return (
    <Button
      variant="light"
      color="red"
      fullWidth
      onClick={sendStartGameRequest}
    >
      Start Da Game !
    </Button>
  );
}
