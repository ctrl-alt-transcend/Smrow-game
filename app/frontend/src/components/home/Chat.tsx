import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Title,
  Paper,
  ScrollArea,
  Stack,
  Group,
  TextInput,
  Button,
} from "@mantine/core";
import { messages as initialMessages } from "../../mocks/chat.mock";
import MessageItem from "./MessageItem";
import type { ChatMessage } from "@shared/types";
import { socialSocket } from "../../sockets/socialSocket";

export default function Chat({chatHistory}: {chatHistory: ChatMessage[] | null}) {
  const [draft, setDraft] = useState("");
  let chat: ChatMessage[] = [];

  if (chatHistory === null) {

    return (
      <Paper withBorder p="md" h="100%">
        <Title order={3} ta="center" mb="md">
          Toxic chat
        </Title>
          loading chat...
      </Paper>
    );
  }
  else if (chatHistory.length > 0) {
    chat = chatHistory;
  }


  function handleSend() {
    if (draft.trim() === "") return;

    socialSocket.emit("chatMessage", {draft})
    setDraft("");
  }


  return (
    <Paper withBorder p="md" h="100%">
      <Title order={3} ta="center" mb="md">
        Toxic chat
      </Title>
      <ScrollArea h={480}>
        <Stack gap="xs" align="flex-start">
          {chat.map((messages) => (
            <MessageItem key={messages.date.toString()} content={messages.content} author={messages.username}/>
          ))}
        </Stack>
      </ScrollArea>
      <Group gap="xs" mt="md">
        <TextInput
          flex={1}
          placeholder="Say something toxic..."
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <Button onClick={handleSend}>send</Button>
      </Group>
    </Paper>
  );
}
