import { Card, Stack, Text, Avatar } from "@mantine/core";
import type { PlayerPublicDto } from "shared";
import { getAvatarSrc } from "../../../components/utils/avatar";

//TODO: Make this responsive
const AVATAR_SIZE = 50;

type PlayerCardProps = {
  name: string;
  level: number;
  score: number;
  avatarURL: string | null;
};

export function PlayerCard({ name, level, score, avatarURL }: PlayerCardProps) {
  return (
    <Card padding={0} withBorder orientation="horizontal">
      <Avatar src={getAvatarSrc(avatarURL)} radius={0} size={AVATAR_SIZE} />
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

export function PlayerPanel({ players }: { players: PlayerPublicDto[] }) {
  return (
    <Stack gap={1}>
      {players.map((player) => (
        <PlayerCard
          key={player.username}
          name={player.username}
          level={1}
          score={player.victoryPoints}
          avatarURL={player.avatarURL}
        />
      ))}
    </Stack>
  );
}
