
import { Title, Paper, Table } from "@mantine/core";
import { games } from "../../mocks/games.mock";
import GameRow from "./GameRow";

export default function GameList(){

	return (

		<Paper withBorder p="md" mih ={600}>
			<Title order={3} mb="md">Game in progress</Title>

		<Table striped highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th ta="left">ID</Table.Th>
					<Table.Th ta="left">Players</Table.Th>
					<Table.Th ta="left">Status</Table.Th>

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
