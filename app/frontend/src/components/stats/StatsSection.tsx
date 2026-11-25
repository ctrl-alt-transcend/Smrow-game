import { Box, Divider, Group, Card, Loader, Text, Title } from "@mantine/core";
import ErrorMessages from "../utils/ErrorMessages";

type StatsSectionProps = {
  title: string;
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
};

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
    <Card withBorder p="sm" h="100%" radius="md">
      <Title order={3} mb="sm" ta="center">
        {title}
      </Title>

      <Card.Section>
        <Divider color="black" />
      </Card.Section>

      <Box pt="sm">{content}</Box>
    </Card>
  );
}
