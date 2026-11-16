import {
  Accordion,
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Center,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import { useGameBoardFactory } from "./hooks/useGameBoardFactory.ts";
import { SelectionMenu } from "./components/ui/SelectionMenu.tsx";
import { DiceRoller } from "./components/ui/DiceRoller.tsx";
import { OptionsModal } from "./components/ui/OptionsModal.tsx";
import { useGameState } from "./hooks/useGameState.ts";
import { type GameDataDto, Phase, TIME_DFLT } from "shared";
import { PlayerPanel } from "./components/ui/PlayerPanel.tsx";
import { ResourcesPanel } from "./components/ui/ResourcesPanel.tsx";
import { EndGameModal } from "./components/ui/EndGameModal.tsx";
import { usePersonalNotification } from "./hooks/usePersonalNotification.ts";
import { useEndGame } from "./hooks/useEndGame.ts";
import GameBoard from "./components/gameboard/GameBoard.tsx";
import GameMasterLog from "./components/ui/GameMasterLog.tsx";
import TurnProgressBar from "./components/ui/TurnProgressBar.tsx";
import SkipTurnButton from "./components/ui/SkipTurnButton.tsx";
import PanContainer from "./components/ui/PanContainer.tsx";
import QuitGameButton from "./components/ui/QuitGameButton.tsx";

export default function Game() {
  const { game } = useGameState();
  if (!game) return <div>Loading game...</div>;
  if (!game.board) return <div>Loading gameboard...</div>;
  return <GameShell game={game} />;
}

function GameShell({ game }: { game: GameDataDto }) {
  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure();
  const [optionsOpened, { open: openOptions, close: closeOptions }] =
    useDisclosure();

  const GameBoardProps = useGameBoardFactory(game.board);
  usePersonalNotification(game.currentPlayer.personalLog);
  useEndGame(game.gameTerminated);

  const waitingForPlayers = game.currentPhase === Phase.PENDING;

  let isMyTurn = game.currentPlayer.playerId === game.whosTurn;
  if (game.currentPlayer.DEVMOD || game.currentPhase === Phase.START)
    isMyTurn = true;
  const masterLog = isMyTurn ? game.currentPlayer.guideLog : game.masterLog;

  const navEnabled = isMyTurn && !waitingForPlayers;
  const isDesktop = useMediaQuery("(min-width: 36em)");

  return (
    <AppShell
      header={{ height: 120 }}
      navbar={{
        width: isDesktop ? 300 : 200,
        breakpoint: "xs",
        collapsed: { desktop: !navbarOpened, mobile: !navbarOpened },
      }}
      padding={0}
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <EndGameModal gameOver={game.gameTerminated} />
      <AppShell.Header>
        <Group h="100%" px="md" gap="lg" wrap="nowrap" align="stretch">
          <Stack gap={20} justify="center">
            <Tooltip label="Options" position="bottom">
              <ActionIcon
                variant="default"
                size="sm"
                onClick={openOptions}
                aria-label="Options"
              >
                <IconSettings size={16} stroke={1.8} />
              </ActionIcon>
            </Tooltip>
            <Burger
              opened={navbarOpened}
              onClick={toggleNavbar}
              size="sm"
              disabled={waitingForPlayers}
              aria-label="Toggle navigation"
            />
          </Stack>

          <Box flex={1} miw={120} py={4}>
            <Stack gap={0} justify="center" h="100%">
              <GameMasterLog log={masterLog} />
              <TurnProgressBar
                durationSeconds={game.settings.turnDurationSeconds ?? TIME_DFLT}
                resetKey={game.whosTurn}
              />
            </Stack>
          </Box>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Stack
            gap="sm"
            style={
              waitingForPlayers
                ? { pointerEvents: "none", opacity: 0.55 }
                : undefined
            }
          >
            <Accordion
              variant="separated"
              multiple
              defaultValue={["resources"]}
            >
              <Accordion.Item value="resources">
                <Accordion.Control>Resources</Accordion.Control>
                <Accordion.Panel>
                  <ResourcesPanel currentPlayer={game.currentPlayer} />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <SelectionMenu
              selected={GameBoardProps.selected}
              settings={game.settings}
              masterLog={game.masterLog}
              isMyTurn={navEnabled}
            />

            <DiceRoller
              currentRoll={game.currentPlayer.currentRoll}
              isMyTurn={navEnabled}
            />

            <SkipTurnButton isMyTurn={navEnabled} />

            <Accordion variant="separated" multiple defaultValue={["players"]}>
              <Accordion.Item value="players">
                <Accordion.Control>Players</Accordion.Control>
                <Accordion.Panel>
                  <PlayerPanel players={game.players} />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {game.winner ? (
          <Center flex={1} w="100%">
            <Stack align="center" gap="xs">
              <Text fz={64} lh={1}>
                🏆
              </Text>
              <Title order={2} ta="center">
                {game.winner} wins!
              </Title>
              <Text c="dimmed">{game.winCondition}</Text>
              <QuitGameButton />
            </Stack>
          </Center>
        ) : waitingForPlayers ? (
          <Center flex={1} w="100%">
            <Stack align="center" gap="xs">
              <Text fz={48} lh={1}>
                ⏳
              </Text>
              <Title order={4}>Waiting for players...</Title>
              <Text c="dimmed">The game starts once everyone has joined.</Text>
            </Stack>
          </Center>
        ) : (
          <Center flex={1} w="100%" h="100%" mih={0} p={0}>
            <PanContainer maxPan={400}>
              <GameBoard {...GameBoardProps} />
            </PanContainer>
          </Center>
        )}
      </AppShell.Main>

      <OptionsModal game={game} opened={optionsOpened} onClose={closeOptions} />
    </AppShell>
  );
}
