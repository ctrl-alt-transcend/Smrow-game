import {
  Accordion,
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Center,
  Group,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import { useGameBoardFactory } from "./hooks/useGameBoardFactory.ts";
import { SelectionMenu } from "./components/ui/SelectionMenu.tsx";
import { DiceRoller } from "./components/ui/DiceRoller.tsx";
import { OptionsModal } from "./components/ui/OptionsModal.tsx";
import { useGameState } from "./hooks/useGameState.ts";
import { type GameDataDto, Phase } from "shared";
import { PlayerPanel } from "./components/ui/PlayerPanel.tsx";
import { ResourcesPanel } from "./components/ui/ResourcesPanel.tsx";
import { EndGameModal } from "./components/ui/EndGameModal.tsx";
import { WaitingPlayersModal } from "./components/ui/WaitingPlayersModal.tsx";
import { usePersonalNotification } from "./hooks/usePersonalNotification.ts";
import { useEndGame } from "./hooks/useEndGame.ts";
import GameBoard from "./components/gameboard/GameBoard.tsx";
import GameMasterLog from "./components/ui/GameMasterLog.tsx";
import TurnProgressBar from "./components/ui/TurnProgressBar.tsx";
import SkipTurnButton from "./components/ui/SkipTurnButton.tsx";
import PanContainer from "./components/ui/PanContainer.tsx";
import { Notifications } from "@mantine/notifications";

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

  let isMyTurn = game.currentPlayer.username === game.whosTurn;
  if (game.currentPhase === Phase.START) isMyTurn = true;

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
      style={{ height: "100dvh", overflow: "visible" }}
    >
      <EndGameModal
        gameOver={game.gameTerminated}
        players={game.players}
        winner={game.winner}
        winCondition={game.winCondition}
      />
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
                durationSeconds={
                  game.currentPlayer.timeToPlay ??
                  game.settings.turnDurationSeconds
                }
                resetKey={`${game.currentPhase}-${game.whosTurn}`}
                label="Time left before auto-play"
                isMyTurn={isMyTurn}
              />
            </Stack>
          </Box>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Box style={{ overflowY: "auto" }}>
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
              disabled={
                game.currentPhase !== Phase.PLACEMENT &&
                game.currentPhase !== Phase.TRADE_BUILD
              }
            />
            <SkipTurnButton
              isMyTurn={navEnabled}
              disabled={game.currentPhase !== Phase.TRADE_BUILD}
            />
            <DiceRoller
              title="Dice Roller"
              currentRoll={game.currentPlayer.currentRoll}
              firstDice={game.currentPlayer.firstDice}
              secondDice={game.currentPlayer.secondDice}
              isMyTurn={navEnabled}
              disabled={
                game.currentPhase !== Phase.START &&
                game.currentPhase !== Phase.RESOURCES
              }
            />
            <Accordion variant="separated" multiple defaultValue={["players"]}>
              <Accordion.Item value="players">
                <Accordion.Control>Players</Accordion.Control>
                <Accordion.Panel>
                  <PlayerPanel players={game.players} />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Box>
      </AppShell.Navbar>
      <AppShell.Main
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "visible",
        }}
      >
        <WaitingPlayersModal
          gameId={game.gameId}
          waitingForPlayers={waitingForPlayers}
          players={game.players}
          game={game}
        />
        <Center flex={1} w="100%" h="100%" mih={0} p={20}>
          <Box style={{ position: "relative", width: "100%", height: "100%" }}>
            <Center h="100%" w="100%">
              <PanContainer maxPan={400}>
                <GameBoard {...GameBoardProps} />
              </PanContainer>
            </Center>
          </Box>
        </Center>
      </AppShell.Main>
      <OptionsModal game={game} opened={optionsOpened} onClose={closeOptions} />
      <Notifications limit={2} />
    </AppShell>
  );
}
