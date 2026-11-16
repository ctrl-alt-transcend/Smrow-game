import { Modal, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import QuitGameButton from "./QuitGameButton.tsx";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { Player } from "shared";

type EndGameModalProps = {
  gameOver: boolean;
  players: Player[];
  winner: string | null;
  winCondition: string | null;
};

export function EndGameModal(EndGameModalProps: EndGameModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (EndGameModalProps.gameOver) {
      open();
    }
  }, [EndGameModalProps.gameOver, open]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="">
        <Title order={3} size="h1">
          {EndGameModalProps.winner} wins!
        </Title>
        <Text c="dark">{EndGameModalProps.winCondition}</Text>
        <PlayerPanel players={EndGameModalProps.players} />
        <QuitGameButton />
      </Modal>
    </>
  );
}
