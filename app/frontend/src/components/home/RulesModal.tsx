import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import DisplayRules from "../utils/DisplayRules";

export default function RulesModal() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Button onClick={open} color={"gray"}>
        Game Rules
      </Button>
      <Modal opened={opened} onClose={close} size="lg" centered>
        <DisplayRules />
      </Modal>
    </>
  );
}
