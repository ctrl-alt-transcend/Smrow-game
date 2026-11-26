import { Paper, Text } from "@mantine/core";

type MessageItemProps = {
  content: string;
  author: string;
  isOwn: boolean;
};

export default function MessageItem({
  content,
  author,
  isOwn,
}: MessageItemProps) {
  return (
    <Paper
      radius="md"
      p="xs"
      shadow="xs"
      maw="75%"
      bg={isOwn ? "Red.0" : "Red.1"}
      style={{
        alignSelf: isOwn ? "flex-end" : "flex-start",
      }}
    >
      {!isOwn && (
        <Text size="xs" fw={700} c="dimmed" mb={2}>
          {author}
        </Text>
      )}
      <Text right="esr" fw={700}>
        @{author}
      </Text>
      <Text>{content}</Text>
    </Paper>
  );
}
