import { useState } from "react";
import {
  Accordion,
  Box,
  Button,
  Group,
  Modal,
  Select,
  Slider,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  MIN_SETTINGS,
  GameboardLayout,
  TraderType,
  MAX_LIMIT,
  MAX_RATE,
  MAX_POINTS,
  MAX_POINTS_TO_WIN,
  MAX_BONUS,
  type SettingsData,
  MIN_MULTIPLIER,
  MAX_MULTIPLIER,
  Phase,
  ResourceType,
  TIME_MIN,
  TIME_MAX,
  DEFAULT_PRESET,
  MAXXING_PRESET,
  CLASSIC_PRESET,
  ROBBER_THRESHOLD_MAX,
} from "shared";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useCreateLobby } from "../../game/utils/game.utils";

type SliderConfig = {
  // Numeric settings only — the layout is handled separately by the Select
  key: Exclude<keyof SettingsData, "gameboardLayout">;
  label: string;
  description?: string;
  min: number;
  max: number;
};

const SECTIONS: { id: string; title: string; sliders: SliderConfig[] }[] = [
  {
    id: "limits",
    title: "Actions & Time limits",
    sliders: [
      {
        key: "turnDurationSeconds",
        label: "Time limit per turn",
        min: TIME_MIN,
        max: TIME_MAX,
      },
      {
        key: "tradeLimit",
        label: "Trades authorized",
        description: `during « ${Phase.TRADE_BUILD} »`,
        min: MIN_SETTINGS,
        max: MAX_LIMIT,
      },
      {
        key: "buildLimit",
        label: "Builds authorized",
        description: `during « ${Phase.TRADE_BUILD} »`,
        min: MIN_SETTINGS,
        max: MAX_LIMIT,
      },
    ],
  },
  {
    id: "trades",
    title: "Trade Rates",
    sliders: [
      {
        key: "specialPortOfferRate",
        label: TraderType.SPECIALIZED_PORT,
        description: "specialized resource to be paid for the targeted one",
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
      {
        key: "genericPortOfferRate",
        label: TraderType.GENERIC_PORT,
        description: "resource to be paid for the targeted one",
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
      {
        key: "reserveOfferRate",
        label: TraderType.RESERVE,
        description: "resource to be paid for the targeted one",
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
    ],
  },
  {
    id: "points",
    title: "Victory Points Earnings",
    sliders: [
      {
        key: "roadPoints",
        label: "Road",
        description: "points per road built",
        min: 0,
        max: MAX_POINTS,
      },
      {
        key: "settlementPoints",
        label: "Settlement",
        description: "points per settlement built",
        min: MIN_SETTINGS,
        max: MAX_POINTS,
      },
      {
        key: "cityPoints",
        label: "City",
        description: "points per ctiy built",
        min: MIN_SETTINGS,
        max: MAX_POINTS,
      },
      {
        key: "pointsToWin",
        label: "Points to win",
        description: "amount of points for victory",
        min: MIN_SETTINGS,
        max: MAX_POINTS_TO_WIN,
      },
    ],
  },
  {
    id: "bonus",
    title: "Resources",
    sliders: [
      {
        key: "robberThreshold",
        label: "Robber Threshold",
        description: `Threshold resources amount for the players to be stolen by the robber when 7 is rolled`,
        min: MIN_MULTIPLIER,
        max: ROBBER_THRESHOLD_MAX,
      },
      {
        key: "resourcesMultiplier",
        label: "Resources Multiplier",
        description: `multiplicator applied to resources produced during « ${Phase.RESOURCES} »`,
        min: MIN_MULTIPLIER,
        max: MAX_MULTIPLIER,
      },
      {
        key: "woodBonus",
        label: `${ResourceType.WOOD}`,
        description: `bonus ${ResourceType.WOOD} resources to start the game`,
        min: 0,
        max: MAX_BONUS,
      },
      {
        key: "sheepBonus",
        label: `${ResourceType.SHEEP}`,
        description: `bonus ${ResourceType.SHEEP} resources to start the game`,
        min: 0,
        max: MAX_BONUS,
      },
      {
        key: "brickBonus",
        label: `${ResourceType.BRICK}`,
        description: `bonus ${ResourceType.BRICK} resources to start the game`,
        min: 0,
        max: MAX_BONUS,
      },
      {
        key: "oreBonus",
        label: `${ResourceType.ORE}`,
        description: `bonus ${ResourceType.ORE} resources to start the game`,
        min: 0,
        max: MAX_BONUS,
      },
      {
        key: "wheatBonus",
        label: `${ResourceType.WHEAT}`,
        description: `bonus ${ResourceType.WHEAT} resources to start the game`,
        min: 0,
        max: MAX_BONUS,
      },
    ],
  },
];

function SettingsSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <Stack gap={4}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Box>
          <Text size="sm" fw={500} component="span">
            {config.label}
          </Text>
          {config.description && (
            <>
              {" "}
              <Text size="xs" c="dimmed" component="span">
                — {config.description}
              </Text>
            </>
          )}
        </Box>
        <Text size="sm" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
          {value}
        </Text>
      </Group>
      <Slider
        min={config.min}
        max={config.max}
        step={1}
        value={value}
        onChange={onChange}
        thumbSize={26}
      />
    </Stack>
  );
}

export default function GameLaunchMenu() {
  const createLobby = useCreateLobby();
  const [values, setValues] = useState<SettingsData>({ ...DEFAULT_PRESET });
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 48em)");

  // Generic setter: handles the layout (string) and numeric sliders alike
  const setValue = <K extends keyof SettingsData>(
    key: K,
    val: SettingsData[K],
  ) => setValues((prev) => ({ ...prev, [key]: val }));

  const reset = () => setValues({ ...DEFAULT_PRESET });
  const maxxing = () => setValues({ ...MAXXING_PRESET });
  const classic = () => setValues({ ...CLASSIC_PRESET });

  return (
    <>
      <Button onClick={open}>Create a game</Button>

      <Modal
        opened={opened}
        onClose={close}
        title="Create a game"
        size="lg"
        centered
        fullScreen={isMobile}
      >
        <Select
          label="Gameboard layout"
          data={Object.values(GameboardLayout) as GameboardLayout[]}
          value={values.gameboardLayout}
          onChange={(val) =>
            val !== null && setValue("gameboardLayout", val as GameboardLayout)
          }
          allowDeselect={false}
          mb="md"
        />
        <Accordion chevronPosition="left">
          {SECTIONS.map((section) => (
            <Accordion.Item key={section.id} value={section.id}>
              <Accordion.Control>{section.title}</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="lg">
                  {section.sliders.map((config) => (
                    <SettingsSlider
                      key={config.key}
                      config={config}
                      value={values[config.key]}
                      onChange={(val) => setValue(config.key, Math.round(val))}
                    />
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
          <Tooltip
            label={
              "Slightly faster variant of the original Catan: little resources bonus and multiplier enabled"
            }
          >
            <Button variant="subtle" color="gray" onClick={reset}>
              Default
            </Button>
          </Tooltip>
          <Tooltip
            label={
              "Huge resources bonus and multiplier, low victory conditions for fast paced games"
            }
          >
            <Button variant="subtle" color="grey" onClick={maxxing}>
              Power Maxxing
            </Button>
          </Tooltip>

          <Tooltip
            label={
              "Based on original rules: slow paced and low resources generation"
            }
          >
            <Button variant="subtle" color="grey" onClick={classic}>
              Classic Catan
            </Button>
          </Tooltip>
          <Button fullWidth={isMobile} onClick={() => createLobby(values)}>
            Validate and create game
          </Button>
        </Group>
      </Modal>
    </>
  );
}
