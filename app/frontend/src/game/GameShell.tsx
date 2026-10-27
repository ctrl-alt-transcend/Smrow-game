import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import GameBoard from "./components/gameboard/GameBoard.tsx";
import { useGameBoardFactory } from "./hooks/useGameBoardFactory.ts";
import { classicLayout } from "./types/gameboard.types.tsx";
import { TileSelection } from "./components/ui/TileSelection.tsx";
import { DiceRoller } from "./components/ui/DiceRoller.tsx";
import GameBoardProvider from "./contexts/GameBoardContext.tsx";
import { CardModel } from "./components/cards/catan-card.tsx";

export default function FullLayout() {
  const [opened, { toggle }] = useDisclosure();
  const GameBoardProps = useGameBoardFactory(classicLayout);

  return (
    <GameBoardProvider layout={classicLayout}>
      <AppShell
        header={{ height: 60 }}
        footer={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "xs",
          collapsed: { desktop: !opened, mobile: !opened },
        }}
        aside={{
          width: 300,
          breakpoint: "xl",
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
            <TileSelection selected={GameBoardProps.selected} />
            <DiceRoller />
          </Group>
        </AppShell.Navbar>
        <AppShell.Main>
          <Group justify="center" align="center">
            <GameBoard {...GameBoardProps} />
          </Group>
          <Group h="100%" p="md" justify="center">
            <CardModel
              name="Wood"
              imageUrl="/images/wood-stack.jpg"
              count={4}
              color="green"
              description="Obtained from forests. Works hand-in-hand with brick to build roads and settlements."
            />
            <CardModel
              name="brick"
              imageUrl="/images/bricks-stack.png"
              count={7}
              color="red"
              description="Obtained from mointains. Used to build roads and settlements."
            />
            <CardModel
              name="grain"
              imageUrl="/images/grain-stack.jpg"
              count={0}
              color="yellow"
              description="Comes from the soil they say. Needed for settlements, cities, and development cards."
            />
            <CardModel
              name="wool"
              imageUrl="/images/wool-stack.jpg"
              count={1}
              color="orange"
              description="It comes from a farm animal. Used in building settlements and buying development cards."
            />
            <CardModel
              name="Ore"
              imageUrl="/images/ore-stack.png"
              count={2}
              color="blue"
              description="Take it from the earth. Essential for city upgrades and development cards."
            />
          </Group>
        </AppShell.Main>
        <AppShell.Aside p="md">Aside</AppShell.Aside>
        <AppShell.Footer p="md">Footer</AppShell.Footer>
      </AppShell>
    </GameBoardProvider>
  );
}
