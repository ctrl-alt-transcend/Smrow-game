import { Stack } from '@mantine/core';
import { PlayerCard } from './PlayerCard.tsx';
import type { Player } from  "../../../../../shared/game/game.types.ts"

export function PlayerPanel({ players }: { players: Player[] }) {

  return (
    <Stack gap={1}>
      {players.map((player) => (
        <PlayerCard key={player.playerId} name={player.username} level={1} score={player.score} avatarURL={player.avatarURL} />
      ))}
      {/* <PlayerCard name="Player1" level={7} score={5} /> */}
      {/* <PlayerCard name="Player2" level={5} score={2} /> */}
      {/* <PlayerCard name="Player3" level={4} score={9} /> */}
      {/* <PlayerCard name="Player4" level={9} score={6} /> */}
    </Stack>
  )
}


