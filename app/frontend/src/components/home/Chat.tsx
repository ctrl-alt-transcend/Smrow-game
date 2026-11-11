import { useEffect, useState } from 'react';
import { socialSocket as socket } from "../../sockets/socialSocket";
import { http } from "../../services/http";
import {
  Title,
  Paper,
  ScrollArea,
  Stack,
  Group,
  TextInput,
  Button,
} from "@mantine/core";
import MessageItem from "./MessageItem";
import type { ChatMessage } from "@shared/types";

export default function Chat() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const onMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => {
        return prevMessages.concat(message);
      });
    }

    const loadOldMessages = async () => {
      try {
        const response = await http.get<ChatMessage[]>("/chat");
        if (cancelled) return;
        
        const history = response.data;
        setMessages(history);
        setLoaded(true);
      }
      catch (error) {
        console.error("Failed to fetch chat history with error - ", error);
      }
    }

    socket.emit("joinChat");
    socket.on("new chat message", onMessage);
    loadOldMessages();

    return () => {
      cancelled = true;
      socket.off("new chat message", onMessage);
      socket.emit("leaveChat");
    };

  }, []);

  if (!loaded) {

    return (
      <Paper withBorder p="md" h="100%">
        <Title order={3} ta="center" mb="md">
          Toxic chat
        </Title>
          loading chat...
      </Paper>
    );
  }


  function handleSend() {
    if (draft.trim() === "") return;

    socket.emit("chatMessage", {draft})
    setDraft("");
  }


  return (
    <Paper withBorder p="md" h="100%">
      <Title order={3} ta="center" mb="md">
        Toxic chat
      </Title>
      <ScrollArea h={480}>
        <Stack gap="xs" align="flex-start">
          {messages.map((message) => (
            <MessageItem key={message.id} content={message.content} author={message.username}/>
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
