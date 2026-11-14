import { useState } from "react";
import {
  Accordion,
  Box,
  Button,
  Group,
  Paper,
  Slider,
  Stack,
  Text,
} from "@mantine/core";
import {
  BUILD_LIMIT_DFLT,
  CITY_POINT_DFLT,
  GENERIC_PORT_RATE_DFLT,
  POINTS_TO_WIN_DFLT,
  RESERVE_RATE_DFLT,
  ROAD_POINT_DFLT,
  SETTLEMENT_POINT_DFLT,
  SPECIAL_PORT_RATE_DFLT,
  TRADE_LIMIT_DFLT,
  MIN_SETTINGS,
  TraderType,
  MAX_LIMIT,
  MAX_RATE,
  MAX_POINTS,
  MAX_POINTS_TO_WIN,
  MAX_BONUS,
  type SettingsData,
} from "shared";
import { useCreateLobby } from "../../game/utils/game.utils";

const DEFAULTS: SettingsData = {
  tradeLimit: TRADE_LIMIT_DFLT,
  buildLimit: BUILD_LIMIT_DFLT,
  specialPortRate: SPECIAL_PORT_RATE_DFLT,
  genericPortRate: GENERIC_PORT_RATE_DFLT,
  reserveRate: RESERVE_RATE_DFLT,
  settlementPoints: SETTLEMENT_POINT_DFLT,
  cityPoints: CITY_POINT_DFLT,
  pointsToWin: POINTS_TO_WIN_DFLT,
  roadPoints: ROAD_POINT_DFLT,
  woodBonus: 0,
  sheepBonus: 0,
  brickBonus: 0,
  oreBonus: 0,
  wheatBonus: 0,
};

type SliderConfig = {
  key: keyof SettingsData;
  label: string;
  description?: string;
  min: number;
  max: number;
};

const SECTIONS: { id: string; title: string; sliders: SliderConfig[] }[] = [
  {
    id: "limits",
    title: "Actions limits (number of action per player)",
    sliders: [
      {
        key: "tradeLimit",
        label: "Trades authorized",
        description: "during « Trade and Build » phase",
        min: MIN_SETTINGS,
        max: MAX_LIMIT,
      },
      {
        key: "buildLimit",
        label: "Builds authorized",
        description: "during « Trade and Build » phase",
        min: MIN_SETTINGS,
        max: MAX_LIMIT,
      },
    ],
  },
  {
    id: "trades",
    title: "Trade rates (price paid for one resource)",
    sliders: [
      {
        key: "specialPortRate",
        label: TraderType.SPECIALIZED_PORT,
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
      {
        key: "genericPortRate",
        label: TraderType.GENERIC_PORT,
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
      {
        key: "reserveRate",
        label: TraderType.RESERVE,
        min: MIN_SETTINGS,
        max: MAX_RATE,
      },
    ],
  },
  {
    id: "points",
    title: "Victory points",
    sliders: [
      {
        key: "roadPoints",
        label: "Road",
        description: "amount of points earned when building a road",
        min: 0,
        max: MAX_POINTS,
      },
      {
        key: "settlementPoints",
        label: "Settlement",
        description: "amount of points earned when building a settlement",
        min: MIN_SETTINGS,
        max: MAX_POINTS,
      },
      {
        key: "cityPoints",
        label: "City",
        description: "amount of points earned when building a city",
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
    title: "Starting resources",
    sliders: [
      { key: "woodBonus", label: "Wood", min: 0, max: MAX_BONUS },
      { key: "sheepBonus", label: "Sheep", min: 0, max: MAX_BONUS },
      { key: "brickBonus", label: "Brick", min: 0, max: MAX_BONUS },
      { key: "oreBonus", label: "Ore", min: 0, max: MAX_BONUS },
      { key: "wheatBonus", label: "Wheat", min: 0, max: MAX_BONUS },
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
        marks={[
          { value: config.min, label: String(config.min) },
          { value: config.max, label: String(config.max) },
        ]}
      />
    </Stack>
  );
}

export default function GameLaunchMenu() {
  const createLobby = useCreateLobby();
  const [values, setValues] = useState<SettingsData>({ ...DEFAULTS });
  const [opened, setOpened] = useState(false);

  const setValue = (key: keyof SettingsData, val: number) =>
    setValues((prev) => ({ ...prev, [key]: Math.round(val) }));

  const reset = () => setValues({ ...DEFAULTS });

  return (
    <Paper shadow="xs" radius="md" p={{ base: "sm", sm: "md" }} w="100%">
      <Button
        variant="light"
        fullWidth
        justify="space-between"
        rightSection={<Text size="sm">{opened ? "▲" : "▼"}</Text>}
        onClick={() => setOpened((o) => !o)}
        aria-expanded={opened}
      >
        Create a game
      </Button>

      {opened && (
        <Box pt="sm">
          <Accordion defaultValue="limits" chevronPosition="left">
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
                        onChange={(val) => setValue(config.key, val)}
                      />
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
          <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
            <Button variant="subtle" color="gray" onClick={reset}>
              Default
            </Button>
            <Button onClick={() => createLobby(values)}>
              Validate and create game
            </Button>
          </Group>
        </Box>
      )}
    </Paper>
  );
}
