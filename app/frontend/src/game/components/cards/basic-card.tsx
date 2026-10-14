import { Card, Image, Text, Badge, Button, Group } from '@mantine/core'

export function Demo() {
  return (
    <Card shadow="sm" padding="lg" withBorder>
      <Card.Section>
        <Image
          src="https://img.magnific.com/premium-photo/stack-wooden-logs-pyramid-shape-isolated_1104427-40640.jpg?semt=ais_hybrid&w=740&q=80"
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>Norway Fjord Adventures</Text>
        <Badge color="pink">On Sale</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        With Fjord Tours you can explore more of the magical fjord landscapes with tours and
        activities on and around the fjords of Norway
      </Text>

      <Button color="blue" fullWidth mt="md">
        Book classic tour now
      </Button>
    </Card>
  );
}
