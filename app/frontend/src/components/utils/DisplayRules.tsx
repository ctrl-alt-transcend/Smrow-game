import { Group, Stack, Text, Title } from "@mantine/core";
import { ALL_RULES } from "shared";

export default function DisplayRules() {
  return (
    <Group>
      {ALL_RULES.map((rule) => (
        <Stack key={rule.title} gap={2}>
          <Title order={4}>{rule.title}</Title>
          <Text size="sm" style={{ whiteSpace: "pre-line" }}>
            {rule.body}
          </Text>
        </Stack>
      ))}
    </Group>
  );
}
