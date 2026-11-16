import { useEffect, useState } from "react";
import { Box, Group, Progress, Text } from "@mantine/core";

type TurnProgressBarProps = {
  durationSeconds: number;
  resetKey: string | number | null;
};

export default function TurnProgressBar({
  durationSeconds,
  resetKey,
}: TurnProgressBarProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  const [prevKey, setPrevKey] = useState(resetKey);
  const [prevDuration, setPrevDuration] = useState(durationSeconds);

  if (prevKey !== resetKey || prevDuration !== durationSeconds) {
    setPrevKey(resetKey);
    setPrevDuration(durationSeconds);
    setRemaining(durationSeconds);
  }

  useEffect(() => {
    if (durationSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, resetKey]);

  const ratio = durationSeconds > 0 ? (remaining / durationSeconds) * 100 : 0;

  return (
    <Box w="100%" mt={2}>
      <Group justify="space-between" gap="xs" wrap="nowrap" h={16}>
        <Text size="xs" c="dimmed" lh={1}>
          Time to play
        </Text>
        <Text size="xs" fw={600} lh={1}>
          {remaining}s
        </Text>
      </Group>
      <Progress value={ratio} size={4} radius="xs" />
    </Box>
  );
}
