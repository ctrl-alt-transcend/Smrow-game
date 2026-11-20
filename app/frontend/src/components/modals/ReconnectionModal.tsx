import { Modal, Title, Group, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { http } from "../../services/http.tsx";

type Props = {
  isInGame: boolean;
  onQuit: () => void;
};

export function ReconnectionModal(props: Props) {
  const navigate = useNavigate();

  if (!props.isInGame) {
    return null;
  }

  async function quitGame() {
    try {
      await http.post("/game/quit");
    } catch (e) {
      console.error("Quit failed", e);
    }
    props.onQuit();
  }

  return (
    <Modal
      opened={true}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Title order={3} size="h6">
        You’re still in a game. Would you like to try logging in again ?
      </Title>
      <Group>
        <Button onClick={() => navigate("/game")}>Go ahed !</Button>
        <Button onClick={quitGame}>No, thanks</Button>
      </Group>
    </Modal>
  );
}
