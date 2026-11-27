import { Paper, Text, Anchor } from "@mantine/core";
import { Link } from "react-router";

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
      {!isOwn ? (
        <Anchor
          component={Link}
          to={`/profile/${encodeURIComponent(author)}`}
          underline="hover"
          c="black"
          fz="lg"
          fw={700}
          display="block"
        >
          <Text right="esr" fw={700}>
            @{author}
          </Text>
        </Anchor>
      ) : (
        <Text right="esr" fw={700}>
          @{author}
        </Text>
      )}
      <Text>{content}</Text>
    </Paper>
  );
}
