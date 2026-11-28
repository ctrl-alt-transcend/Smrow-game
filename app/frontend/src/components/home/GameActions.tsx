import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useJoinLobby } from "../../game/utils/game.utils.tsx";
import GameLaunchMenu from "./GameLaunchMenu.tsx";
import RulesModal from "./RulesModal.tsx";

function JoinLobbyModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const gameForm = useForm({
    initialValues: {
      gameId: "",
    },
    validate: {
      gameId: (val: string) =>
        val.trim().length === 0 ? "field is empty" : null,
    },
  });
  const joinLobby = useJoinLobby();

  return (
    <Modal opened={opened} onClose={onClose} title="Join lobby" centered>
      <form onSubmit={gameForm.onSubmit((values) => joinLobby(values.gameId))}>
        <TextInput
          radius="xs"
          label="Join a game"
          placeholder="Inset game code..."
          value={gameForm.values.gameId}
          onChange={(event) =>
            gameForm.setFieldValue("gameId", event.currentTarget.value)
          }
        />
        <Group justify="flex-end" mt="md">
          <Button type="button" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Join</Button>
        </Group>
      </form>
    </Modal>
  );
}

export default function GameActions() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Group>
      <Button onClick={open}>Join da game</Button>
      <JoinLobbyModal opened={opened} onClose={close} />
      <GameLaunchMenu />
      <RulesModal />
    </Group>
  );
}
