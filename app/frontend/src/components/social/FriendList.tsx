import { useState } from "react";
import { IconMinus } from "@tabler/icons-react";
import {
  ActionIcon,
  Avatar,
  Group,
  Table,
  Text,
  Paper,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { socialSocket as socket } from "../../sockets/socialSocket.tsx";
import { useFriend } from "../../hooks/useFriend.tsx";
import { Link } from "react-router";
import { getAvatarSrc } from "../utils/avatar";
export function FriendList() {
  const friends = useFriend();
  const [actionError, setActionError] = useState<string | null>(null);
  // const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!friends) {
    return <Text>Loading friend list...</Text>;
  } else if (friends.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        You don't have any friend :(
      </Text>
    );
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      socket.emit("friend: remove", friendId);
    } catch {
      setActionError("Could not remove friend, try again later.");
    }
  };

  const rows = friends.map((item) => (
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
        <Text>{item.isOnline ? "online" : "offline"}</Text>
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
