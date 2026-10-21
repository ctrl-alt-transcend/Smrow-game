import { Avatar, Divider, Grid, Paper, Stack, Text, Title } from '@mantine/core';

export default function ProfilePage(){

	return (
		<>
			<Title mb="xl" ta="center">Profile</Title>

			<Grid>
				<Grid.Col span={{ base: 12, md: 4 }}>
					<Paper withBorder p="md" h="100%">
						<Stack align="center" gap="xs">
							<Avatar size={120} radius="md" color="Red">MG</Avatar>
							<Title order={3}>Mr. Goblin</Title>
						</Stack>

						<Divider my="md" />

						<Stack gap="sm" style={{ overflowWrap: 'anywhere' }}>
							<Paper withBorder radius="sm" p="xs">
								<Text size="xs" c="dimmed">Username</Text>
								<Text>mrgoblin</Text>
							</Paper>

							<Paper withBorder radius="sm" p="xs">
								<Text size="xs" c="dimmed">Email</Text>
								<Text>goblin@fighter.dev</Text>
							</Paper>

							<Paper withBorder radius="sm" p="xs">
								<Text size="xs" c="dimmed">Member since</Text>
								<Text>12 October 2026</Text>
							</Paper>

							<Paper withBorder radius="sm" p="xs">
								<Text size="xs" c="dimmed">Bio</Text>
								<Text>Trades wood for sheep. Never gives back the longest road.</Text>
							</Paper>
						</Stack>
					</Paper>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 8 }}>
					<Paper withBorder p="md" mih={400} h="100%">
						<Title order={3} mb="md">Friends</Title>
						<Text c="dimmed" ta="center" py="xl">No friend yet ..</Text>
					</Paper>
				</Grid.Col>
			</Grid>
		</>
	);
}
