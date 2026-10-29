import { Title, Text, Paper, Table } from "@mantine/core";
import {useEffect, useState} from "react";
import GameRow from "./GameRow";
import type { AxiosResponse } from "axios";
import type { GameDataDto } from "@shared/game/game.types";
import { http } from "../../services/http";

export default function GameList() {

  const [games, setGames] = useState<GameDataDto[]>([]);

  useEffect(() => {
    http.get<GameDataDto[]>("/game").then((res: AxiosResponse) => setGames(res.data));
  }, []);

  //const res: AxiosResponse = http.get<GameDataDto[]>("/game"); //WARN: what happend if request failed

  return (
    <Paper withBorder p="md" mih={600} h="100%">
      <Title order={3} mb="md">
        Game in progress
      </Title>

      {games.length === 0 ? (
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
      )}
    </Paper>
  );
}
