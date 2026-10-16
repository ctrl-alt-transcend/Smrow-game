
import { Grid, Title } from '@mantine/core';
import GameActions from '../components/home/GameActions';
import GameList from '../components/home/GameList';
import Chat from '../components/home/Chat';


export default function HomePage(){
	return (
	<>

	<Title mb="xl" ta="center">Amazing Catan</Title>

	<Grid>
		<Grid.Col span={12}>
				<GameActions/>
		</Grid.Col>
		<Grid.Col span={{ base: 12, md: 5 }}>
     		<GameList/>
  		</Grid.Col>
	<Grid.Col span={{ base: 12, md: 7 }}>

	<Chat/>
  		</Grid.Col>
	</Grid>

	</>
	)
}
