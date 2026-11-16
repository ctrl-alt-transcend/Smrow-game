import { Accordion, Divider, Modal, Stack, Text, Title } from "@mantine/core";
import { type GameDataDto, type SettingsData } from "shared";
import { PlayerPanel } from "./PlayerPanel.tsx";
import QuitGameButton from "./QuitGameButton.tsx";

type OptionsModalProps = {
  game: GameDataDto;
  opened: boolean;
  onClose: () => void;
};

export function OptionsModal({ game, opened, onClose }: OptionsModalProps) {
  const s: SettingsData = game.settings;
  const rules: { title: string; body: string }[] = [
    {
      title: "Start Phase",
      body:
        "Every player rolls the dice. The starting order is decided by the " +
        "dice result, ranked from the highest to the lowest roll.",
    },
    {
      title: "Placement Phase",
      body:
        "Each player places one settlement and one adjacent road to set up " +
        "their first positions. They then collect their starting resources " +
        "from the three tiles touching their settlement.",
    },
    {
      title: "Resource Phase",
      body:
        "On their turn, a player rolls the dice. If the total matches a " +
        "tile touching one of their settlements, they collect the " +
        "corresponding resources. Rolling a 7 triggers the robber rule " +
        "instead of any production.",
    },
    {
      title: "Trade & Build Phase",
      body:
        `During this phase the player gets ${s.tradeLimit} trade action(s) ` +
        "to trade with the reserve (unlimited stock, no bankruptcy) and " +
        "with generic or specialized harbors, plus " +
        `${s.buildLimit} build action(s) to build roads, place new ` +
        "settlements, or upgrade existing settlements into cities.",
    },
    {
      title: "End of the game",
      body:
        "After the Placement Phase, the game alternates between the " +
        "Resource Phase and Trade & Build Phase until a player reaches " +
        `${s.pointsToWin} victory point(s).`,
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
                    <Title order={6}>{rule.title}</Title>
                    <Text size="sm" c="dimmed">
                      {rule.body}
                    </Text>
                  </Stack>
                ))}
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
