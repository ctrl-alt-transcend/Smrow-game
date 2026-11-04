//import { useCallback } from "react";
import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { socket } from "../../../socket.tsx";

export default function SkipTurnButton() {
  //const handleConfirm = useCallback(() => {
  //  socket.emit('skip');
  //}, []);

  const handleConfirm = () => {
    socket.emit("skip");
  };

  const openModal = () => {
    modals.openConfirmModal({
      title: "Confirm skip turn",
      children: (
        <Text size="sm">Are you sure you want to skip your turn ?</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: handleConfirm,
      centered: true,
    });
  };

  return (
    <Button onClick={openModal} fullWidth>
      Skip turn
    </Button>
  );
}
