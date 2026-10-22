import { List } from '@mantine/core';

// Component used to uniformize error receiving in fronten
export default function ErrorMessages({ error }: { error?: string | string[] | null}) {
  if (!error) return null;
  const messages = Array.isArray(error) ? error : [error];

  return (
    <List
      mt="xs"
      spacing="xs"
      c="red"
      size="sm"
    >
      {messages.map((msg, i) => (
        <List.Item key={i}>{msg}</List.Item>
      ))}
    </List>
  );
}