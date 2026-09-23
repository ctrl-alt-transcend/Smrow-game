
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';


export default function AppLayout () {

	return (
		<AppShell header={{ height: 60 }}>
			<AppShell.Header/>
			<AppShell.Main>
				<Outlet/>
			</AppShell.Main>
		</AppShell>
	);
}
