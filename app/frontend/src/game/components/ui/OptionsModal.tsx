import { Accordion, Divider, Modal, Stack, Text, Title } from "@mantine/core";
import {
  BuildingType,
  CURRENT_GAME_SETTINGS,
  END_GAME_INFO,
  END_GAME_PHASE,
  Phase,
  PLACEMENT_PHASE_INFO,
  RESOURCE_PHASE_INFO,
  ResourceType,
  SPECIAL_RULES,
  SPECIAL_RULES_INFO,
  START_PHASE_INFO,
  TRADE_BUILD_INFO,
  type GameDataDto,
  type SettingsData,
} from "shared";
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
    {
      title: `${CURRENT_GAME_SETTINGS}`,
      body:
        `Gameboard layout: ${s.gameboardLayout}\n\n` +
        "Time & Actions limits\n" +
        `• Time per player turn: ${s.turnDurationSeconds}\n` +
        `• Trade limit during « ${Phase.TRADE_BUILD} »: ${s.tradeLimit}\n` +
        `• Build limit during « ${Phase.TRADE_BUILD} »: ${s.buildLimit}\n\n` +
        "Trading Rates\n" +
        `• Specialized Port rate: ${s.specialPortOfferRate}\n` +
        `• Generic Port rate: ${s.genericPortOfferRate}\n` +
        `• Reserve rate: ${s.reserveOfferRate}\n\n` +
        "Points Earned\n" +
        `• Point(s) per ${BuildingType.ROAD}: ${s.roadPoints}\n` +
        `• Point(s) per ${BuildingType.SETTLEMENT}: ${s.settlementPoints}\n` +
        `• Point(s) per ${BuildingType.CITY}: ${s.cityPoints}\n` +
        `• Points to win: ${s.pointsToWin}\n\n` +
        "Bonus\n" +
        `• Resources multiplier: ${s.resourcesMultiplier}\n` +
        `• ${ResourceType.WOOD} bonus: ${s.woodBonus}\n` +
        `• ${ResourceType.SHEEP} bonus: ${s.sheepBonus}\n` +
        `• ${ResourceType.BRICK} bonus: ${s.brickBonus}\n` +
        `• ${ResourceType.ORE} bonus: ${s.oreBonus}\n` +
        `• ${ResourceType.WHEAT} bonus: ${s.wheatBonus}\n`,
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
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ whiteSpace: "pre-line" }}
                    >
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
