import { Modal, Stack, Text, Title } from "@mantine/core";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { PlayerPublicDto } from "shared";
import QuitGameButton from "./QuitGameButton.tsx";

type EndGameProps = {
  gameOver: boolean;
  players: PlayerPublicDto[];
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
      <Stack justify="center">
        <Title order={3} size="h1">
          {endGameProps.winner} wins!
        </Title>
        <Text c="dark">{endGameProps.winCondition}</Text>
        <PlayerPanel players={endGameProps.players} />
        <QuitGameButton />
      </Stack>
    </Modal>
  );
}
