import { Modal, Title } from "@mantine/core";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { Player } from "shared";
import StartGameButton from "./StartGameButton.tsx";

type WaitingPlayersProps = {
  waitingForPlayers: boolean;
  players: Player[];
};

export function WaitingPlayersModal(waitingPlayersProps: WaitingPlayersProps) {
  if (!waitingPlayersProps.waitingForPlayers) {
    return null;
  }

  return (
    <Modal
      opened={true}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Title order={3} size="h1">
        Waiting players !
      </Title>
      <PlayerPanel players={waitingPlayersProps.players} />
      <StartGameButton />
    </Modal>
  );
}
