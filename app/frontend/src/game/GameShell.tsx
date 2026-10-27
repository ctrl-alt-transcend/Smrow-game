import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GameBoard from './components/gameboard/GameBoard.tsx';
import { useGameBoardFactory } from './hooks/useGameBoardFactory.ts';
import { TileSelection } from './components/ui/TileSelection.tsx';
import { DiceRoller } from './components/ui/DiceRoller.tsx';
import GameMasterLog from './components/ui/GameMasterLog.tsx';
import { useGameState } from './hooks/useGameState.ts';
import type { GameData } from '@shared/game/game.types.ts';
import { PlayerPanel } from './components/ui/PlayerPanel.tsx';

export default function Game() {
  const { game } = useGameState();
  if (!game || !game.board)
    return <div>Loading game...</div>;
  return <GameShell game={game} />;
}

function GameShell({ game }: { game: GameData }) {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory(game.board);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 95 }}
      navbar={{
        width: 300,
        breakpoint: 'xs',
        collapsed: { desktop: !opened, mobile: !opened },
      }}
      aside={{
        width: 300,
        breakpoint: 'xl',
        collapsed: { desktop: false, mobile: true },
      }}
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
          <TileSelection
            selected={GameBoardProps.selected}
            masterLog={game.masterLog}
          />
          <DiceRoller diceRoll={game.diceRoll} masterLog={game.masterLog} />
        </Group>
      </AppShell.Navbar>

      <AppShell.Main>
        <Group justify="center" align="center">
          <GameBoard {...GameBoardProps} />
        </Group>
      </AppShell.Main>

      <AppShell.Aside p="md">
        Aside
        {/* <PlayerPanel players={game.players} /> */}
      </AppShell.Aside>

      <AppShell.Footer p="xs">
        <GameMasterLog log={game.masterLog} />
      </AppShell.Footer>
    </AppShell>
  );
}
