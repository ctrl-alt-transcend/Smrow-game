import { Paper, Progress, SimpleGrid, Text } from "@mantine/core";
import type { PlayerStats } from "shared";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  children?: React.ReactNode;
};

function StatCard({ label, value, children }: StatCardProps) {
  return (
    <Paper withBorder radius="sm" p="sm">
      <Text size="xs" c="dimmed" tt="uppercase">
        {label}
      </Text>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      {children}
    </Paper>
  );
}

export default function StatsSummary({ stats }: { stats: PlayerStats }) {
  const { level } = stats;
  const levelRange = level.nextLevelXp - level.currentLevelXp;
  const levelProgress = ((level.xp - level.currentLevelXp) / levelRange) * 100;

  return (
    <SimpleGrid cols={{ base: 2, sm: 3 }}>
      <StatCard label="Level" value={level.level}>
        <Progress value={levelProgress} size="sm" mt="xs" />
        <Text size="xs" c="dimmed" mt={4}>
          {level.xp} / {level.nextLevelXp} XP
        </Text>
      </StatCard>
      <StatCard label="Games played" value={stats.gamesPlayed} />
      <StatCard label="Wins" value={stats.wins} />
      <StatCard label="Losses" value={stats.losses} />
      <StatCard label="Win rate" value={`${stats.winRate}%`} />
      <StatCard label="Average rank" value={stats.averageRank ?? "-"} />
    </SimpleGrid>
  );
}
