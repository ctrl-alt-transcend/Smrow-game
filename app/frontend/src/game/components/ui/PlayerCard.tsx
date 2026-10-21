import { Card, Stack, Text, Avatar } from '@mantine/core';
import { PlayerCardProps } from '../../../../../shared/game/ui.types'
import defaultAvatar from "../../../../public/default-pp.png"

const AVATAR_SIZE = 50;

export function PlayerCard({name, level, score, avatarUrl}: PlayerCardProps) {

  const avatarSrc = avatarUrl || defaultAvatar;

  return (
    <Card padding={0} withBorder orientation="horizontal">
      <Card.Section withBorder>
          <Avatar
          radius={0}
          src={avatarSrc}
          size={AVATAR_SIZE}
          />

      </Card.Section> 
        <Card.Section px="xs">
          <Stack gap={0} h={AVATAR_SIZE}>
            <Text fz="lg" fw="700" lh={1.1}>{name}</Text>
            <Text fz="xs" lh={1.1}> Level: {level}</Text>
            <Text fz="xs" lh={1.1}> Score: {score}</Text>
          </Stack>
        </Card.Section>
    </Card>
  );
}


