import { Button } from "@mantine/core";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";
import { useCallback } from "react";
import { Phase } from "shared";

export default function SkipTurnButton({
  isMyTurn,
  phase,
}: {
  isMyTurn: boolean;
  phase: Phase;
}) {
  const handleSkipRequest = useCallback(() => {
    socket.emit("skip");
  }, []);

  return (
    <Button
      onClick={handleSkipRequest}
      disabled={!isMyTurn || phase === Phase.RESOURCES}
      fullWidth
    >
      End turn
    </Button>
  );
}
