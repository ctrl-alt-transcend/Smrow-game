import { useEffect, useState } from "react";
import { socialSocket as socket } from "../../sockets/socialSocket";
import { http } from "../../services/http";
import { Title, Text, Divider, Table, Card } from "@mantine/core";
import type { GameList } from "shared";
import GameRow from "./GameRow";

export default function ListGames() {
  const [loaded, setLoaded] = useState(false);
  const [games, setGames] = useState<GameList[]>([]);

  useEffect(() => {
    let cancelled = false;
    const getGamesList = async () => {
      try {
        const response = await http.get<GameList[]>("/game");
        if (cancelled) return;

        const gameList = response.data;
        setGames(gameList);
        setLoaded(true);
      } catch (error) {
        console.error("Failed to fetch games - ", error);
      }
    };

    const onGameListUpdate = (gameList: GameList[]) => {
      setGames(gameList);
    };

    const onConnect = () => {
      socket.emit("gameList:join");
      getGamesList();
    };

    socket.on("gameList:update", onGameListUpdate);
    socket.on("connect", onConnect);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off("connect", onConnect);
      socket.off("gameList:update", onGameListUpdate);
      socket.emit("gameList:leave");
    };
  }, []);

  return (
    <Card withBorder p="sm" h="100%" radius="md">
      <Title order={3} mb="sm" ta="center">
        Game in progress
      </Title>
      <Card.Section>
        <Divider color="black" />
      </Card.Section>

      {!loaded ? (
        <Text c="dimmed" ta="center" py="xl">
          No game in progress ..
        </Text>
      ) : games.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No game in progress ..
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={300} p="sm">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="left">ID</Table.Th>
                <Table.Th ta="left">Players</Table.Th>
                <Table.Th ta="left">Status</Table.Th>

                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {games.map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Card>
  );
}
