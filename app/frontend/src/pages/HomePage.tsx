import { Grid, Title } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import GameActions from "../components/home/GameActions";
import GameList from "../components/home/GameList";
import Chat from "../components/home/Chat";
import { fetchChatHistory } from "../services/chat.service";
import type { ChatMessage } from "@shared/types";

const chatHistory: ChatMessage[] | null = await fetchChatHistory()

export default function HomePage()   {
  const { user } = useAuth();

  return (
    <>
      <Title mb="xl" ta="center">
        Amazing Catan
      </Title>
      <Title>Hello {user?.name} !</Title>

      <Grid>
        <Grid.Col span={12}>
          <GameActions />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <GameList />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Chat chatHistory={chatHistory}/>
        </Grid.Col>
      </Grid>
    </>
  );
}
