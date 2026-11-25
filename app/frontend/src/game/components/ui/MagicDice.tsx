import type { MagicDiceDto } from "shared";
import { DiceRoller } from "./DiceRoller";
import { Box, Card, Stack, Text } from "@mantine/core";
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
    isMalus,
    isPersonnal,
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
          disabled={false}
        />
        <Card withBorder radius="md" shadow="sm" padding="sm" w="100%">
          {rule ? (
            <Stack justify="center" w="100%" gap={"xs"}>
              <Text fw={700} size="sm">
                {ruleLabel}
              </Text>
              <Text size="xs" c={isMalus ? "red" : "green"} fw={600}>
                {isPersonnal ? "PERSONNAL" : "COLLECTIVE"}{" "}
                {isMalus ? "MALUS" : "BONUS"}
              </Text>
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
