import { Modal, Text, Title } from "@mantine/core";
import QuitGameButton from "./QuitGameButton.tsx";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { Player } from "shared";

type EndGameProps = {
  gameOver: boolean;
  players: Player[];
  winner: string | null;
  winCondition: string | null;
};

export function EndGameModal(endGameProps: EndGameProps) {
  if (!endGameProps.gameOver) {
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
        {endGameProps.winner} wins!
      </Title>
      <Text c="dark">{endGameProps.winCondition}</Text>
      <PlayerPanel players={endGameProps.players} />
      <QuitGameButton />
    </Modal>
  );
}
