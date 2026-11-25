import { Box, Card, Group, Stack, Text, Title } from "@mantine/core";
import type { MagicDiceDto } from "shared";

export default function MagicEffect({
  magicDice,
}: {
  magicDice: MagicDiceDto | null;
}) {
  let label = "No active Magic Dice Effect";
  if (magicDice?.rule) {
    label = magicDice.isPersonnal
      ? `${magicDice.rule} for ${magicDice.lastRoller}`
      : `${magicDice.rule} for everyone`;
  }

  const rollCount = magicDice?.rollCount ?? 0;
  const active = magicDice?.canRoll ?? false;

  return (
    <Box style={{ flex: 1, minWidth: 0 }}>
      <Card withBorder radius="md" shadow="sm" padding="6px" w="100%" h="100%">
        <Stack
          gap={0}
          align="center"
          justify="center"
          h="100%"
          style={{ overflow: "hidden" }}
        >
          <Group gap={6} wrap="nowrap">
            <Title order={6} ta="center">
              Magic Dice Effect
            </Title>
            {[0, 1].map((i) => {
              const filled = i < rollCount;
              return (
                <Box
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: filled
                      ? "var(--mantine-color-violet-7)"
                      : "transparent",
                    border: filled
                      ? "none"
                      : "1.5px solid rgba(109, 74, 255, 0.6)",
                    ...(filled
                      ? { animation: "tickPop 0.4s ease" }
                      : active
                        ? { animation: "softPulse 1.8s ease-in-out infinite" }
                        : undefined),
                  }}
                />
              );
            })}
          </Group>
          <Text size="lg" ta="center" lineClamp={2}>
            {label}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}
