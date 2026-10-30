import { Button, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useCreateLobby, useJoinLobby } from '../../game/utils/game.utils.tsx'

function JoinLobbyModal({opened, onClose } : {opened: boolean, onClose: () => void }) {
  const gameForm = useForm({
    initialValues: {
      gameId: '',
    },
    validate: {
      gameId: (val: string) => (val.trim().length === 0 ? "field is empty" : null),
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
          onChange={(event) => gameForm.setFieldValue("gameId", event.currentTarget.value)}
        />
      </form>
    </Modal>
  )
};

export default function GameActions() {
  const createLobby = useCreateLobby();
  const [opened, { open, close}] = useDisclosure(false);

	return (
		<Group>
			<Button onClick={open}>Join da game</Button>
      <JoinLobbyModal opened={opened} onClose={close}/>
			<Button variant="default" onClick={createLobby}>Create a game</Button>
		</Group>
	)
}
