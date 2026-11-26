import { useState } from "react";
import { Anchor, Avatar, Group, Table, Text } from "@mantine/core";
import type { LeaderboardEntry } from "shared";
import ShowMoreButton, { VISIBLE_ROWS } from "./ShowMoreButton";
import { Link } from "react-router";

type LeaderboardProps = {
  entries: LeaderboardEntry[];
  currentUserId?: string;
};

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, VISIBLE_ROWS);

  return (
    <>
      <Table.ScrollContainer minWidth={310}>
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
            {visible.map((entry) => {
              const isMe = entry.userId === currentUserId;
              return (
                <Table.Tr
                  key={entry.userId}
                  bg={isMe ? "var(--mantine-primary-color-light)" : undefined}
                >
                  <Table.Td fw={700}>{entry.rank}</Table.Td>
                  <Table.Td>
                    <Anchor
                      component={Link}
                      to={`/profile/${encodeURIComponent(entry.username)}`}
                      underline="hover"
                      fz="lg"
                      fw={500}
                      display="block"
                    >
                      <Group gap="xs" wrap="nowrap">
                        <Avatar src={entry.avatarURL} size="sm" radius="xl">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Text size="sm" fw={isMe ? 700 : undefined}>
                          {entry.username}
                        </Text>
                      </Group>
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{entry.wins}</Table.Td>
                  <Table.Td>{entry.winRate}%</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <ShowMoreButton
        total={entries.length}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
      />
    </>
  );
}
