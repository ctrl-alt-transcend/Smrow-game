import {
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import type { Achievement } from "shared";

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { label, description, unlocked, progress, goal } = achievement;

  return (
    <Paper withBorder radius="sm" p="sm" opacity={unlocked ? 1 : 0.6}>
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text fw={600}>{label}</Text>
        <ThemeIcon
          color={unlocked ? "green" : "gray"}
          variant="light"
          radius="xl"
          size="sm"
          aria-label={unlocked ? "Unlocked" : "Locked"}
        >
          {unlocked ? <IconLockOpen size={14} /> : <IconLock size={14} />}
        </ThemeIcon>
      </Group>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
      <Progress
        value={(progress / goal) * 100}
        color={unlocked ? "green" : undefined}
        size="sm"
        mt="xs"
      />
      <Text size="xs" c="dimmed" mt={4}>
        {progress} / {goal}
      </Text>
    </Paper>
  );
}

export default function AchievementList({
  achievements,
}: {
  achievements: Achievement[];
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </SimpleGrid>
  );
}
