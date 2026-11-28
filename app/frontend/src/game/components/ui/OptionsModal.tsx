import { Accordion, Divider, Modal, Stack } from "@mantine/core";
import { type GameDataDto } from "shared";
import { PlayerPanel } from "./PlayerPanel.tsx";
import QuitGameButton from "./QuitGameButton.tsx";
import { RulesSettingsAccordion } from "../../utils/game.utils.tsx";

type OptionsModalProps = {
  game: GameDataDto;
  opened: boolean;
  onClose: () => void;
};

export function OptionsModal({ game, opened, onClose }: OptionsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Options"
      size="lg"
      fullScreen={window.innerWidth < 480}
      centered
      styles={{
        content: {
          maxHeight: "85dvh",
        },
        body: {
          overflowY: "auto",
        },
      }}
    >
      <Stack gap="md">
        <RulesSettingsAccordion game={game} />
        <Accordion>
          <Accordion.Item value="players">
            <Accordion.Control>Players</Accordion.Control>
            <Accordion.Panel>
              <PlayerPanel players={game.players} />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider />
        <QuitGameButton />
      </Stack>
    </Modal>
  );
}
