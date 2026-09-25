
import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router';
import { HeaderTabs } from '../components/navbar/HeaderTabs';


export default function AppLayout () {

	return (
		<AppShell header={{ height: 100 }}>
			<AppShell.Header>
				<HeaderTabs/>
			</AppShell.Header>
			<AppShell.Main>
				<Outlet/>
			</AppShell.Main>
		</AppShell>
	);
}
