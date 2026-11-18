import { Group, Loader, Paper, Text, Title } from "@mantine/core";
import ErrorMessages from "../utils/ErrorMessages";

type StatsSectionProps = {
  title: string;
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
};

// Common frame of the stats blocks: title, loader, error and empty state
export default function StatsSection({
  title,
  loading,
  error,
  empty = false,
  emptyText = "Nothing to show yet ..",
  children,
}: StatsSectionProps) {
  let content = children;
  if (loading)
    content = (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  else if (error) content = <ErrorMessages error={error} />;
  else if (empty)
    content = (
      <Text c="dimmed" ta="center" py="xl">
        {emptyText}
      </Text>
    );

  return (
    <Paper withBorder p="md" h="100%">
      <Title order={3} mb="md">
        {title}
      </Title>
      {content}
    </Paper>
  );
}
