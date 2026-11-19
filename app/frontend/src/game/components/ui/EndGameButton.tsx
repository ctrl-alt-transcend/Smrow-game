import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useNavigate } from "react-router";

export default function QuitGameButton() {
  const navigate = useNavigate();
  const confirmQuit = () =>
    modals.openConfirmModal({
      title: "Quit game",
      children: <Text size="sm">Are you sure you want to leave the game?</Text>,
      labels: { confirm: "Quit", cancel: "Stay" },
      onConfirm: () => {
        navigate("/home", { replace: true });
      },
      centered: true,
    });

  return (
    <Button variant="light" color="red" fullWidth onClick={confirmQuit}>
      Quit Game
    </Button>
  );
}
