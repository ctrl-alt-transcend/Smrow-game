
import { Title, Paper, Table } from "@mantine/core";
import { games } from "../../mocks/games.mock";
import GameRow from "./GameRow";

export default function GameList(){

	return (

		<Paper withBorder p="md">
			<Title order={3}>Parties en cours</Title>

		<Table striped highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th ta="center">ID</Table.Th>
					<Table.Th ta="center">Joueurs</Table.Th>
					<Table.Th ta="center">Statut</Table.Th>
					<Table.Th ></Table.Th>
				</Table.Tr>
			</Table.Thead>

			<Table.Tbody>
				{games.map((game) => (
					<GameRow key={game.id} game={game}/>
				))}
			</Table.Tbody>
		</Table>
		</Paper>
	)
}
