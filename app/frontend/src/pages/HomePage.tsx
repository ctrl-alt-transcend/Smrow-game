import { Grid, Title } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import GameActions from "../components/home/GameActions";
import ListGames from "../components/home/GameList";
import Chat from "../components/home/Chat";
import { http } from "../services/http";
import { ReconnectionModal } from "../components/modals/ReconnectionModal.tsx";
import { useState, useEffect } from "react";
import { Notifications } from "@mantine/notifications";

export default function HomePage() {
  const { user } = useAuth();
  const [isInGame, setIsInGame] = useState(false);

  useEffect(() => {
    http.get("/game/me").then((res) => setIsInGame(res.data.gameId !== null));
  }, []);

  return (
    <>
      <Notifications />
      <ReconnectionModal
        isInGame={isInGame}
        onQuit={() => setIsInGame(false)}
      />

      <Title fz={{ base: "h5", md: "h3" }}>Hello {user?.name} !</Title>

      <Grid>
        <Grid.Col span={12}>
          <GameActions />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <ListGames />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Chat />
        </Grid.Col>
      </Grid>
    </>
  );
}
