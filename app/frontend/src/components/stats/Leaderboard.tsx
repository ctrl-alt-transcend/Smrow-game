import { Avatar, Group, Table, Text } from "@mantine/core";
import type { LeaderboardEntry } from "shared";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  return (
    <Table.ScrollContainer minWidth={360}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#</Table.Th>
            <Table.Th>Player</Table.Th>
            <Table.Th>Wins</Table.Th>
            <Table.Th>Win rate</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {entries.map((entry) => {
            const isMe = entry.userId === currentUserId;
            return (
              <Table.Tr
                key={entry.userId}
                bg={isMe ? "var(--mantine-primary-color-light)" : undefined}
              >
                <Table.Td fw={700}>{entry.rank}</Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar src={entry.avatarURL} size="sm" radius="xl">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={isMe ? 700 : undefined}>
                      {entry.username}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>{entry.wins}</Table.Td>
                <Table.Td>
                  {entry.winRate}%
                  <Text span size="xs" c="dimmed">
                    {" "}
                    ({entry.gamesPlayed} games)
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
