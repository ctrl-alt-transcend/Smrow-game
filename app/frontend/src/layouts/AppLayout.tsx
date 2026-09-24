
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';
import Navbar from '../components/navbar/Navbar';


export default function AppLayout () {

	return (
		<AppShell header={{ height: 60 }}>
			<AppShell.Header>
				<Navbar></Navbar>
			</AppShell.Header>
			<AppShell.Main>
				<Outlet/>
			</AppShell.Main>
		</AppShell>
	);
}
