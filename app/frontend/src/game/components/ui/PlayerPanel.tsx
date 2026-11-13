import { Card, Stack, Text, Avatar } from "@mantine/core";
import type { Player, PlayerCardProps } from "shared";
import defaultAvatar from "../../../../public/default-pp.png";

const AVATAR_SIZE = 50;

export function PlayerCard({ name, level, score, avatarURL }: PlayerCardProps) {
  const avatarSrc = avatarURL || defaultAvatar;

  return (
    <Card padding={0} withBorder orientation="horizontal">
      <Card.Section withBorder>
        <Avatar radius={0} src={avatarSrc} size={AVATAR_SIZE} />
      </Card.Section>
      <Card.Section px="xs">
        <Stack gap={0} h={AVATAR_SIZE}>
          <Text fz="lg" fw="700" lh={1.1}>
            {name}
          </Text>
          <Text fz="xs" lh={1.1}>
            {" "}
            Level: {level}
          </Text>
          <Text fz="xs" lh={1.1}>
            {" "}
            Victory points: {score}
          </Text>
        </Stack>
      </Card.Section>
    </Card>
  );
}

export function PlayerPanel({ players }: { players: Player[] }) {
  return (
    <Stack gap={1}>
      {players.map((player) => (
        <PlayerCard
          key={player.playerId}
          name={player.username}
          level={1}
          score={player.victoryPoints}
          avatarURL={player.avatarURL}
        />
      ))}
    </Stack>
  );
}
