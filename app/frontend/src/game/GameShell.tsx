import { AppShell, Burger, Group, Stack, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import GameBoard from './components/gameboard/GameBoard.tsx';
import { useGameBoardFactory } from './hooks/useGameBoardFactory.ts';
import { classicLayout } from './types/gameboard.types.tsx';
import { SelectionInfo } from './components/ui/SelectionInfo.tsx';
import { DiceRoller } from './components/gameboard/DiceRoller.tsx';

export default function FullLayout() {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory(classicLayout);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'xs', collapsed: { mobile: !opened } }}
      aside={{ width: 300, breakpoint: 'xl', collapsed: { desktop: false, mobile: true } }}
      padding="xs"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          Header
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Center>
          <Stack
          gap="xl"
          align="center"
          ml={5}
          mr={5}
          mt={5}
          mb={5} >
            <SelectionInfo selected={GameBoardProps.selected} />
            <DiceRoller/>
          </Stack>
        </Center>
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