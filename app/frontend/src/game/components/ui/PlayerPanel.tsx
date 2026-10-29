import { Stack } from '@mantine/core';
import { PlayerCard } from './PlayerCard.tsx';
import type { Player } from  "@shared/game/game.types.ts"

export function PlayerPanel({ players }: { players: Player[] }) {

  return (
    <Stack gap={1}>
      {players.map((player) => (
        <PlayerCard key={player.playerId} name={player.username} level={1} score={player.score} avatarURL={player.avatarURL} />
      ))}
    </Stack>
  )
}


