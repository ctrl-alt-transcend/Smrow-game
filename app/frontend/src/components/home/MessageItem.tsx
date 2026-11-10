import { Paper, Text } from "@mantine/core";

type MessageItemProps = {
  content: string;
  author: string;
};

export default function MessageItem({ content, author }: MessageItemProps) {
  return (
    <Paper bg="Red.1" p="xs" maw="95%" style={{ overflowWrap: "anywhere" }}>
      <Text fw={700}>@{author}</Text>
      <Text>{content}</Text>
    </Paper>
  );
}
