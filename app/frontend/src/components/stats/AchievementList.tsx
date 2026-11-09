import { Badge, Group, Paper, Progress, SimpleGrid, Text } from "@mantine/core";
import type { Achievement } from "shared";

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { label, description, unlocked, progress, goal } = achievement;

  return (
    <Paper withBorder radius="sm" p="sm" opacity={unlocked ? 1 : 0.6}>
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text fw={600}>{label}</Text>
        {unlocked && (
          <Badge color="green" variant="light">
            Unlocked
          </Badge>
        )}
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
