
import { Grid, Title } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import GameActions from '../components/home/GameActions';
import GameList from '../components/home/GameList';
import Chat from '../components/home/Chat';


export default function HomePage(){
		const { register, login, user, logout, loading } = useAuth();

	return (
	<>

	<Title mb="xl" ta="center">Amazing Catan</Title>
	<Title>Hello {user?.name} !</Title>

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
