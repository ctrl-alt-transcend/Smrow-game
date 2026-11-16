import { useState } from "react";
import { Badge, Table, Text, ThemeIcon } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import type { MatchHistoryEntry } from "shared";
import ShowMoreButton, { VISIBLE_ROWS } from "./ShowMoreButton";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function MatchRow({ match }: { match: MatchHistoryEntry }) {
  return (
    <Table.Tr>
      <Table.Td>{formatDate(match.playedAt)}</Table.Td>
      <Table.Td>
        {match.isWinner ? (
          <ThemeIcon color="green" radius="xl" size="sm" aria-label="Victory">
            <IconTrophy size={14} />
          </ThemeIcon>
        ) : (
          <Badge color="gray" variant="light">
            #{match.playerRank}
          </Badge>
        )}
      </Table.Td>
      <Table.Td>{match.winPoints}</Table.Td>
      <Table.Td>
        {match.opponents.length === 0 ? (
          <Text c="dimmed">-</Text>
        ) : (
          match.opponents.map((o) => (
            <Text key={o.userId} size="sm" fw={o.isWinner ? 700 : undefined}>
              #{o.playerRank} {o.username}
            </Text>
          ))
        )}
      </Table.Td>
    </Table.Tr>
  );
}

export default function MatchHistory({
  matches,
}: {
  matches: MatchHistoryEntry[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? matches : matches.slice(0, VISIBLE_ROWS);

  return (
    <>
      <Table.ScrollContainer minWidth={500}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Result</Table.Th>
              <Table.Th>Points</Table.Th>
              <Table.Th>Opponents</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {visible.map((match) => (
              <MatchRow key={match.gameId} match={match} />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <ShowMoreButton
        total={matches.length}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
      />
    </>
  );
}
