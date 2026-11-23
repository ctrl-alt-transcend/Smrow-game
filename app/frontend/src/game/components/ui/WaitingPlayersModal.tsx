import { Modal, Title, Stack } from "@mantine/core";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { PlayerPublicDto, SettingsData } from "shared";
import StartGameButton from "./StartGameButton.tsx";
import { DisplaySetting } from "../../utils/game.utils.tsx";
import QuitGameButton from "./QuitGameButton.tsx";

type WaitingPlayersProps = {
  gameId: string;
  waitingForPlayers: boolean;
  players: PlayerPublicDto[];
  settings: SettingsData;
};

export function WaitingPlayersModal(waitingPlayersProps: WaitingPlayersProps) {
  if (!waitingPlayersProps.waitingForPlayers) {
    return null;
  }

  return (
    <Modal
      opened={true}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack justify={"center"}>
        <Title order={3} size="h1">
          Waiting players !
        </Title>
        <PlayerPanel players={waitingPlayersProps.players} />
        <StartGameButton nPlayers={waitingPlayersProps.players.length} />
        <DisplaySetting
          gameId={waitingPlayersProps.gameId}
          settings={waitingPlayersProps.settings}
        />
        <QuitGameButton />
      </Stack>
    </Modal>
  );
}
