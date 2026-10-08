import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GameBoard from './components/gameboard/GameBoard.tsx';
import { useGameBoardFactory } from './hooks/useGameBoardFactory.ts';
import { classicLayout } from './types/gameboard.types.tsx';
import { SelectionInfo } from './components/ui/SelectionInfo.tsx';

export default function FullLayout() {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory(classicLayout);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          Header
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
        <SelectionInfo selected={GameBoardProps.selected} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Group>
          <AppShell.Section>
            <GameBoard {...GameBoardProps} />
          </AppShell.Section>
        </Group>
      </AppShell.Main>
      <AppShell.Aside p="md">
        Aside
      </AppShell.Aside>
      <AppShell.Footer p="md">
        Footer
      </AppShell.Footer>
    </AppShell>
  );
}