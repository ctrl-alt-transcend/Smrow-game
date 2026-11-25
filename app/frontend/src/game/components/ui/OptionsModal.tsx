import { Accordion, Divider, Modal, Stack, Text, Title } from "@mantine/core";
import {
  END_GAME_INFO,
  END_GAME_PHASE,
  Phase,
  PLACEMENT_PHASE_INFO,
  RESOURCE_PHASE_INFO,
  SPECIAL_RULES,
  SPECIAL_RULES_INFO,
  START_PHASE_INFO,
  TRADE_BUILD_INFO,
  type GameDataDto,
} from "shared";
import { PlayerPanel } from "./PlayerPanel.tsx";
import QuitGameButton from "./QuitGameButton.tsx";
import {
  DisplayMagicDiceRules,
  DisplaySetting,
} from "../../utils/game.utils.tsx";

type OptionsModalProps = {
  game: GameDataDto;
  opened: boolean;
  onClose: () => void;
};

export function OptionsModal({ game, opened, onClose }: OptionsModalProps) {
  const rules: { title: string; body: string }[] = [
    {
      title: `${Phase.START}`,
      body: `${START_PHASE_INFO}`,
    },
    {
      title: `${Phase.PLACEMENT}`,
      body: `${PLACEMENT_PHASE_INFO}`,
    },
    {
      title: `${Phase.RESOURCES}`,
      body: `${RESOURCE_PHASE_INFO}`,
    },
    {
      title: `${Phase.TRADE_BUILD}`,
      body: `${TRADE_BUILD_INFO}`,
    },
    {
      title: `${END_GAME_PHASE}`,
      body: `${END_GAME_INFO}`,
    },
    {
      title: `${SPECIAL_RULES}`,
      body: `${SPECIAL_RULES_INFO}`,
    },
  ];

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
        <Accordion variant="separated" multiple defaultValue={["rules"]}>
          <Accordion.Item value="rules">
            <Accordion.Control>Game Rules</Accordion.Control>
            <Accordion.Panel>
              <Stack gap="xs">
                {rules.map((rule) => (
                  <Stack key={rule.title} gap={2}>
                    <Title order={4}>{rule.title}</Title>
                    <Text size="sm" style={{ whiteSpace: "pre-line" }}>
                      {rule.body}
                    </Text>
                  </Stack>
                ))}
                <DisplayMagicDiceRules />
                <DisplaySetting gameId={game.gameId} settings={game.settings} />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

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
