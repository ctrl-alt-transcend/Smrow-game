import { Button } from "@mantine/core";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";
import { useCallback } from "react";

export default function SkipTurnButton({
  isMyTurn,
  disabled,
}: {
  isMyTurn: boolean;
  disabled: boolean;
}) {
  const handleSkipRequest = useCallback(() => {
    socket.emit("game:skip");
  }, []);

  return (
    <Button
      onClick={handleSkipRequest}
      disabled={!isMyTurn || disabled}
      fullWidth
    >
      End turn
    </Button>
  );
}
