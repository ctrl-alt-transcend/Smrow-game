import { Box, Card, Stack, Text, Title } from "@mantine/core";
import type { MagicDiceDto } from "shared";

export default function MagicDice({
  magicDice,
}: {
  magicDice: MagicDiceDto | null;
}) {
  let label: string = "No active Magic Dice Effect";
  if (magicDice && magicDice.rule) {
    if (magicDice.isPersonnal) {
      label = `${magicDice.rule} for ${magicDice.lastRoller}`;
    } else {
      label = `${magicDice.rule} for everyone`;
    }
  }

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      <Card withBorder radius="md" shadow="sm" padding="6px" w="100%" h="100%">
        <Stack
          gap={0}
          align="center"
          justify="center"
          h="100%"
          style={{ overflow: "hidden" }}
        >
          <Title order={6} ta="center">
            Magic Dice Effect
          </Title>
          <Text size={"lg"} ta="center" lineClamp={2}>
            {label}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}
