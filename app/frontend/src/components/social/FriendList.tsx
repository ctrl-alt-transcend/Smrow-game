import { useState } from "react";
import { IconMinus } from "@tabler/icons-react";
import {
  ActionIcon,
  Avatar,
  Group,
  Table,
  Text,
  Loader,
  Paper,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { useFetch } from "../../hooks/useFetch";
import { getFriendList, removeFriend } from "../../services/social.service";
import ErrorMessages from "../utils/ErrorMessages";
import { Link } from "react-router";
import { getAvatarSrc } from "../utils/avatar";

export function FriendList() {
  const friendlist = useFetch(getFriendList);
  const [actionError, setActionError] = useState<string | null>(null);
  // const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      setActionError(null);
      // setActionSuccess(null);
      await removeFriend(friendId);
      // setActionSuccess("Friend removed successfully.");
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
        You don't have any friend :(
      </Text>
    );
  }

  const rows = friendlist.data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Anchor
          component={Link}
          to={`/profile/${encodeURIComponent(item.username)}`}
          underline="hover"
          fz="lg"
          fw={500}
        >
          <Group gap="sm">
            <Avatar
              size={40}
              src={getAvatarSrc(item.avatar)}
              radius={40}
              alt=""
            />
            <Text>{item.username}</Text>
          </Group>
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" c="dimmed">
          Bio
        </Text>
        <Text fz="sm">{item.bio ?? "-"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Remove friend"
            onClick={() => handleRemoveFriend(item.id)}
          >
            <IconMinus size={16} stroke={1.5} />
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
      {/* {actionSuccess && (
        <Text c="green" fz="sm" p="sm">
          {actionSuccess}
        </Text>
      )} */}
      <ScrollArea.Autosize mah={400} type="auto" offsetScrollbars="y">
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
