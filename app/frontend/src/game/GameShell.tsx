import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GameBoard from './components/gameboard/GameBoard.tsx';
import { useGameBoardFactory } from './hooks/useGameBoardFactory.ts';
import { TileSelection } from './components/ui/TileSelection.tsx';
import { DiceRoller } from './components/ui/DiceRoller.tsx';
import GameMasterLog from './components/ui/GameMasterLog.tsx';
import { useGameState } from './hooks/useGameState.ts';
import type { GameDataDto, Resources } from '@shared/game/game.types.ts';
import { PlayerPanel } from './components/ui/PlayerPanel.tsx';
import SkipTurnButton from './components/ui/SkipTurnButton.tsx';
import { ResourcesPanel } from './components/ui/ResourcesPanel.tsx';
import { ReserveIcon } from './components/gameboard/GameIcon.tsx';
import { usePersonalNotification } from './hooks/usePersonalNotification.ts';

export default function Game() {
  const { game } = useGameState();
  if (!game)
    return <div>Loading game...</div>;
  if (!game.board)
    return <div>Loading gameboard...</div>;
  return <GameShell game={game} />;
}

function GameShell({ game }: { game: GameDataDto }) {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory(game.board);
  usePersonalNotification(game.currentPlayer.personalLog);

  let resources: Resources;
  const p = game.players?.at(0);
  if(p) {
    resources = p.resources;
  } else {
    resources = {
      wheat: -1,
      wood: -1,
      brick: -1,
      sheep: -1,
      ore: -1
    }
  }

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
        breakpoint: 'md',
        collapsed: { desktop: false, mobile: true },
      }}
      padding="xs"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          Header gameId: {game.gameId}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group grow gap="md" w="100%" align="center" justify="center">
          <TileSelection
            selected={GameBoardProps.selected}
            masterLog={game.masterLog}
          />
          <DiceRoller diceRoll={game.currentRoll} masterLog={game.masterLog} />
          <SkipTurnButton/>
        </Group>
      </AppShell.Navbar>

      <AppShell.Main>
        <Group justify="center" align="center">
          {!game.winner && <GameBoard {...GameBoardProps} />}
          {game.winner && <Title> {game.winner} {game.winCondition} </Title>}
        </Group>
      </AppShell.Main>

      <AppShell.Aside p="md">
        Aside
        <PlayerPanel players={game.players} />
        <ResourcesPanel currentPlayer={game.currentPlayer}/>
      </AppShell.Aside>

      <AppShell.Footer p="xs">
        <GameMasterLog log={game.masterLog} />
      </AppShell.Footer>
    </AppShell>
  );
}
