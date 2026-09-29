
import { Grid, Stack } from '@mantine/core';
import GameActions from '../components/home/GameActions';
import GameList from '../components/home/GameList';
import Chat from '../components/home/Chat';


export default function HomePage(){
	return (
	<Grid>
		<Grid.Col span={{ base: 12, md: 8 }}>
    		<Stack>
     			<GameActions/>
     			<GameList/>
    		</Stack>
  		</Grid.Col>
	<Grid.Col span={{ base: 12, md: 4 }}>

	<Chat/>
  		</Grid.Col>
	</Grid>
	)
}
