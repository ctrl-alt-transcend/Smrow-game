import type { MagicDiceDto } from "shared";
import { DiceRoller } from "./DiceRoller";
import { Box, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import TurnProgressBar from "./TurnProgressBar";

/**
 * One tick per magic-dice roll. Filled slots show WHO rolled and WHAT value.
 * Re-mounted via key on every new roll id -> the pop animation replays for
 * every client, even the ones who did not roll (compensates the local-only
 * DiceRoller animation).
 */
function RollSlot({
  index,
  val,
  roller,
  isLatest,
  canRoll,
}: {
  index: number;
  val: number | null;
  roller: string | null;
  isLatest: boolean;
  canRoll: boolean;
}) {
  const filled = val !== null;
  return (
    <Tooltip
      label={filled ? `${roller} rolled ${val}` : "Nobody touched it yet"}
      withArrow
    >
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 600,
          border: filled
            ? "2px solid var(--mantine-color-violet-7)"
            : "2px dashed rgba(109, 74, 255, 0.5)",
          background: filled ? "var(--mantine-color-violet-7)" : "transparent",
          color: filled ? "white" : "var(--mantine-color-dimmed)",
          ...(filled
            ? isLatest
              ? { animation: "tickPop 0.4s ease" }
              : undefined
            : canRoll
              ? { animation: "softPulse 1.8s ease-in-out infinite" }
              : undefined),
        }}
      >
        {filled ? val : index + 1}
      </Box>
    </Tooltip>
  );
}

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
    firstRoll,
    secondRoll,
    currentRoll,
    rule,
    ruleLabel,
    isMalus,
    isPersonnal,
    log,
    canRoll,
    lastRoller,
  } = magicDice;

  const latestId = currentRoll?.id ?? null;

  return (
    <Box w={400}>
      <Stack gap="xs" align="center" w="100%">
        <DiceRoller
          title="Magic Dice"
          currentRoll={currentRoll}
          isMyTurn={true}
          disabled={!canRoll}
        />

        <Group gap="md">
          <RollSlot
            index={0}
            val={firstRoll?.val ?? null}
            roller={firstRoll?.roller ?? null}
            isLatest={firstRoll?.id === latestId}
            canRoll={canRoll && !firstRoll}
          />
          <RollSlot
            index={1}
            val={secondRoll?.val ?? null}
            roller={secondRoll?.roller ?? null}
            isLatest={secondRoll?.id === latestId}
            canRoll={canRoll}
          />
        </Group>

        <Card withBorder radius="md" shadow="sm" padding="sm" w="100%">
          {rule ? (
            <Stack justify="center" w="100%" gap="xs">
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
                  ? `${lastRoller} touched the dice... one more roll to reveal the rule !`
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
