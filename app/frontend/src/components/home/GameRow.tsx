
import type { Game } from '../../mocks/games.mock'
import { Table, Button } from "@mantine/core";


type GameRowProps = {
	game: Game;
};

export default function GameRow({ game }: GameRowProps) {

	return (
		<Table.Tr>
			<Table.Td>{game.id}</Table.Td>
			<Table.Td>{game.players.length}/{game.maxPlayers}</Table.Td>
			<Table.Td>{game.status}</Table.Td>
			<Table.Td><Button>Rejoindre</Button></Table.Td>
		</Table.Tr>

	);

}