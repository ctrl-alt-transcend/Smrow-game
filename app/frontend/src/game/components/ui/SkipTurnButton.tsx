import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";
import { useCallback } from "react";

export default function SkipTurnButton({ isMyTurn }: { isMyTurn: boolean }) {
  const handleSkipRequest = useCallback(() => {
    socket.emit("game:skip");
  }, []);

  const openModal = () => {
    modals.openConfirmModal({
      title: "Confirm end turn",
      children: <Text size="sm">Are you sure you want to end your turn ?</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: handleSkipRequest,
      centered: true,
    });
  };

  return (
    <Button onClick={openModal} disabled={!isMyTurn} fullWidth>
      End turn
    </Button>
  );
}
