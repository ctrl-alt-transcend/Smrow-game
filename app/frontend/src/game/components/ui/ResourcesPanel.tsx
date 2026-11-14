import {
  Box,
  Card,
  Group,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import type { PlayerDto } from "shared";

export type Resources = {
  wood: number;
  brick: number;
  wheat: number;
  sheep: number;
  ore: number;
};

type ResourceMeta = {
  key: keyof Resources;
  label: string;
  icon: string;
};

const RESOURCE_META: ResourceMeta[] = [
  { key: "wood", label: "Wood", icon: "🌲" },
  { key: "brick", label: "Brick", icon: "🧱" },
  { key: "wheat", label: "Wheat", icon: "🌾" },
  { key: "sheep", label: "Sheep", icon: "🐑" },
  { key: "ore", label: "Ore", icon: "🪨" },
];

type ResourcesPanelProps = {
  currentPlayer: PlayerDto;
  title?: string;
  /** Affiche ou non la ligne de total */
  withTotal?: boolean;
};

export function ResourcesPanel({
  currentPlayer,
  title = currentPlayer.playerId,
  withTotal = true,
}: ResourcesPanelProps) {
  const total = RESOURCE_META.reduce(
    (sum, meta) => sum + currentPlayer.resources[meta.key],
    0,
  );

  const rows = RESOURCE_META.map((meta) => (
    <Table.Tr key={meta.key}>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="transparent" size="sm" fz="md">
            {meta.icon}
          </ThemeIcon>
          <Text size="sm" visibleFrom="xs">
            {meta.label}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td style={{ textAlign: "right" }}>
        <Text size="sm" fw={600}>
          {currentPlayer.resources[meta.key]}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box style={{ flex: 1, minWidth: 160, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" padding="sm">
        <Stack gap="xs" justify="center" align="center">
          <Title order={4}>{title}</Title>
          <Table
            fs="sm"
            verticalSpacing="4px"
            horizontalSpacing="sm"
            w="100%"
            maw={240}
          >
            <Table.Tbody>{rows}</Table.Tbody>
            {withTotal && (
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Td>
                    <Text size="sm" fw={500} c="dimmed">
                      Total
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="sm" fw={700}>
                      {total}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </Stack>
      </Card>
    </Box>
  );
}
