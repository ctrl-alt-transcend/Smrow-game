import { Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";

type EndGameModalProps = {
  gameOver: boolean;
};

export function EndGameModal(EndGameModalProps: EndGameModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (EndGameModalProps.gameOver) {
      open();
    }
  }, [EndGameModalProps, open]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="End Game">
        <Text>Game finished !</Text>
      </Modal>
    </>
  );
}
