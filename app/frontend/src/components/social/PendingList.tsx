import { useState } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  ScrollArea,
  ActionIcon,
  Group,
  Table,
  Text,
  Loader,
  Paper,
} from "@mantine/core";
import { useFetch } from "../../hooks/useFetch";
import { getPendingList } from "../../services/social.service";
import ErrorMessages from "../utils/ErrorMessages";
import { denyRequest, acceptRequest } from "../../services/social.service";

export function PendingList() {
  const pendingList = useFetch(getPendingList);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = async (
    action: (id: string) => Promise<unknown>,
    friendId: string,
    errorMessage = "Something went wrong, try again later.",
  ) => {
    try {
      setActionError(null);
      await action(friendId);
      pendingList.refetch();
    } catch {
      setActionError(errorMessage);
    }
  };

  if (pendingList.loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (pendingList.error) {
    return <ErrorMessages error={pendingList.error} />;
  }

  if (!pendingList.data || pendingList.data.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No pending request !
      </Text>
    );
  }

  const rows = pendingList.data.map((item) => (
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
            onClick={() =>
              handleAction(
                denyRequest,
                item.id,
                "Could not deny request, try again later.",
              )
            }
          >
            <IconX size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            aria-label="Accept friend"
            onClick={() =>
              handleAction(
                acceptRequest,
                item.id,
                "Could not accept request, try again later.",
              )
            }
          >
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
      <ScrollArea.Autosize mah={300} type="auto" offsetScrollbars="y">
        <Table
          verticalSpacing="md"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
    </Paper>
  );
}
