import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GameBoard from './components/gameboard/GameBoard.tsx';
import { useGameBoardFactory } from './hooks/useGameBoardFactory.ts';
import { classicLayout } from './types/gameboard.types.tsx';
import { TileSelection } from './components/ui/TileSelection.tsx';
import { DiceRoller } from './components/ui/DiceRoller.tsx';
import GameBoardProvider, { useGameBoard } from './contexts/GameBoardContext.tsx';

export default function FullLayout() {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory();

  return (
    <GameBoardProvider layout={classicLayout} >
      <AppShell
        header={{ height: 60 }}
        footer={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'xs', collapsed: { desktop: !opened, mobile: !opened } }}
        aside={{ width: 300, breakpoint: 'xl', collapsed: { desktop: false, mobile: true } }}
        padding="xs"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} size="sm" />
            Header
          </Group>
        </AppShell.Header>
      <AppShell.Navbar p="md">
        <Group grow gap="md" w="100%" align="center" justify="center">
          <TileSelection selected={GameBoardProps.selected} />
          <DiceRoller />
        </Group>
      </AppShell.Navbar>
        <AppShell.Main>
          <Group justify='center' align='center'>
            <GameBoard {...GameBoardProps} />
          </Group>
        </AppShell.Main>
        <AppShell.Aside p="md">
          Aside
        </AppShell.Aside>
        <AppShell.Footer p="md">
          Footer
        </AppShell.Footer>
      </AppShell>
    </GameBoardProvider>
  );
}