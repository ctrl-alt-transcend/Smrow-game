import { Modal, Title, Stack } from "@mantine/core";
import { PlayerPanel } from "./PlayerPanel.tsx";
import type { GameDataDto, PlayerPublicDto } from "shared";
import StartGameButton from "./StartGameButton.tsx";
import { RulesSettingsAccordion } from "../../utils/game.utils.tsx";
import QuitGameButton from "./QuitGameButton.tsx";

type WaitingPlayersProps = {
  gameId: string;
  waitingForPlayers: boolean;
  players: PlayerPublicDto[];
  game: GameDataDto;
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
        <RulesSettingsAccordion game={waitingPlayersProps.game} />
        <QuitGameButton />
      </Stack>
    </Modal>
  );
}
