import type { MagicDiceDto } from "shared";
import { DiceRoller } from "./DiceRoller";
import { Box, Card, Group, Stack, Text } from "@mantine/core";
import TurnProgressBar from "./TurnProgressBar";

export default function MagicDice({
  magicDice,
  timeLeft,
  resetKey,
}: {
  magicDice: MagicDiceDto | null;
  timeLeft: number;
  resetKey: string;
}) {
  if (!magicDice) return;

  const {
    currentRoll,
    rule,
    ruleLabel,
    ruleDescription,
    isMalus,
    log,
    canRoll,
    lastRoller,
  } = magicDice;
  return (
    <Box w={400}>
      <Stack gap="xs" align="center" w="100%">
        <DiceRoller
          title="Magic Dice"
          currentRoll={currentRoll}
          isMyTurn={true}
          theme="magic"
          disabled={false}
        />
        <Card withBorder radius="md" shadow="sm" padding="sm" w="100%">
          {rule ? (
            <Stack gap={4}>
              <Group justify="space-between" w="100%" wrap="nowrap">
                <Text fw={700} size="sm">
                  {ruleLabel}
                </Text>
                <Text size="xs" c={isMalus ? "red" : "green"} fw={600}>
                  {isMalus ? "MALUS" : "BONUS"}
                </Text>
              </Group>
              <Text size="sm">{ruleDescription}</Text>
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              {canRoll
                ? lastRoller
                  ? "One more roll to reveal the rule..."
                  : "Nobody dared touch the magic dice yet..."
                : "The magic dice faded away..."}
            </Text>
          )}
        </Card>
        {log && (
          <Card withBorder radius="md" padding="xs" w="100%">
            <Text size="sm" fs="italic" ta="center">
              {log}
            </Text>
          </Card>
        )}

        <TurnProgressBar durationSeconds={timeLeft} resetKey={resetKey} />
      </Stack>
    </Box>
  );
}
