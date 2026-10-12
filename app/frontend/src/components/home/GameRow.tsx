
import type { Game } from '../../mocks/games.mock'
import { Table, Button } from "@mantine/core";


type GameRowProps = {
	game: Game;
};

export default function GameRow({ game }: GameRowProps) {

	const isFull = game.players.length >= game.maxPlayers;
	const isPlaying = game.status === 'playing'
	const variant = isPlaying ? 'default' : 'filled';


	return (
		<Table.Tr>
			<Table.Td>{game.id}</Table.Td>
			<Table.Td>{game.players.length}/{game.maxPlayers}</Table.Td>
			<Table.Td>{game.status}</Table.Td>
			<Table.Td>
				<Button disabled={!isPlaying && isFull} variant={variant} miw={100}>
				{isPlaying? 'Spectate' : 'Join'}
				</Button>
			</Table.Td>
		</Table.Tr>

	);

}