import { useEffect, useRef, useState } from "react";
import { socialSocket as socket } from "../../sockets/socialSocket";
import { http } from "../../services/http";
import {
  Title,
  Text,
  Box,
  Divider,
  Card,
  Stack,
  BackgroundImage,
  Group,
  TextInput,
  Button,
} from "@mantine/core";
import MessageItem from "./MessageItem";
import type { ChatMessage } from "shared";

export default function Chat() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const onMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => {
        return prevMessages.concat(message);
      });
    };

    const loadOldMessages = async () => {
      try {
        const response = await http.get<ChatMessage[]>("/chat");
        if (cancelled) return;

        const history = response.data;
        setMessages(history);
        setLoaded(true);
      } catch (error) {
        console.error("Failed to fetch chat history with error - ", error);
      }
    };

    const onConnect = () => {
      socket.emit("chat:join");
      loadOldMessages();
    };

    socket.on("chat:message", onMessage);
    socket.on("connect", onConnect);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off("connect", onConnect);
      socket.off("chat:message", onMessage);
      socket.emit("chat:leave");
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [messages, loaded]);

  if (!loaded) {
    return (
      <Card withBorder p="md" h="100%">
        <Card.Section withBorder p="sm">
          <Title order={3} ta="center">
            Toxic chat
          </Title>
        </Card.Section>
        <Text ta="center" py="md">
          loading chat...
        </Text>
      </Card>
    );
  }

  function handleSend() {
    if (draft.trim() === "") return;

    socket.emit("chat:send", { draft });
    setDraft("");
  }

  return (
    <Card withBorder p="md" h="100%" radius="md">
      <Card.Section withBorder p="sm">
        <Title order={3} ta="center">
          Toxic chat
        </Title>
      </Card.Section>

      <Card.Section>
        <Divider color="black" />
      </Card.Section>

      <Card.Section>
        <BackgroundImage src="/assets/bg-whatsapp.webp">
          <Box h={480} p="sm" style={{ overflowY: "auto" }} ref={viewportRef}>
            <Stack gap="xs" align="flex-start">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  content={message.content}
                  author={message.username}
                />
              ))}
            </Stack>
          </Box>
        </BackgroundImage>
      </Card.Section>

      <Card.Section>
        <Divider color="black" />
      </Card.Section>

      <Card.Section withBorder p="sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Group gap="xs">
            <TextInput
              flex={1}
              placeholder="Say something toxic..."
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
            />
            <Button onClick={handleSend}>send</Button>
          </Group>
        </form>
      </Card.Section>
    </Card>
  );
}
