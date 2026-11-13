import { useEffect, useState } from 'react';
import { socialSocket as socket } from "../../sockets/socialSocket";
import { http } from "../../services/http";
import { Title, Text, Paper, Table } from "@mantine/core";
import type { GameList } from "@shared/game/game.types";
import GameRow from "./GameRow";

export default function GameList() {
  const [loaded, setLoaded] = useState(false);
  const [games, setGames] = useState<GameList[]>([]);
 
  useEffect(() => {
    let cancelled = false;
    const getGamesList = async() => {
      try {
        const response = await http.get<GameList[]>("/game");
        if (cancelled) return;

        const gameList = response.data;
        setGames(gameList);
        setLoaded(true);
      }
      catch (error) {
        console.error("Failed to fetch chat history with error - ", error);
      }
    }

    const onGameListUpdate = (game: GameList[]) => {
      return games.concat(game);
    };

    socket.emit("joinGameList");
    socket.on("game list update", onGameListUpdate);
    getGamesList();

    return () => {
      cancelled = true;
      socket.off("game list update", onGameListUpdate);
      socket.emit("leaveGameList");
    }
  });

  return (
    <Paper withBorder p="md" mih={600} h="100%">
      <Title order={3} mb="md">
        Game in progress
      </Title>

      {!loaded ? (
        <Text c="dimmed" ta="center" py="xl">
          No game in progress ..
        </Text>
      ) : (

      games.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No game in progress ..
        </Text>
      ) : (
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
      ))}
    </Paper>
  );
}

