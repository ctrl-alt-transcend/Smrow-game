import { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import { ActionIcon, Group, Table, Text, Loader, Paper } from "@mantine/core";
import { useFetch } from "../../hooks/useFetch";
import { getPendingList, removeFriend } from "../../services/social.service";
import ErrorMessages from "../utils/ErrorMessages";

export function PendingList() {
  const friendlist = useFetch(getPendingList);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      setActionError(null);
      await removeFriend(friendId);
      friendlist.refetch();
    } catch {
      setActionError("Could not remove friend, try again later.");
    }
  };

  if (friendlist.loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (friendlist.error) {
    return <ErrorMessages error={friendlist.error} />;
  }

  if (!friendlist.data || friendlist.data.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No pending request !
      </Text>
    );
  }

  const rows = friendlist.data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td style={{ overflow: "hidden" }}>
        <Text fz="lg" fw={500} truncate="end">
          {item.username}
        </Text>
      </Table.Td>
      <Table.Td w={90} p={0}>
        <Group gap={4} wrap="nowrap" justify="center">
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Remove friend"
            onClick={() => handleRemoveFriend(item.id)}
          >
            <IconX size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" aria-label="Accept friend">
            <IconCheck size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper withBorder>
      {actionError && (
        <Text c="red" fz="sm" p="sm">
          {actionError}
        </Text>
      )}
      <Table
        verticalSpacing="md"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Paper>
  );
}
