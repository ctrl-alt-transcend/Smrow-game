import { useState } from "react";
import { IconMinus } from "@tabler/icons-react";
import {
  ActionIcon,
  Avatar,
  Box,
  Group,
  Table,
  Text,
  Paper,
  Anchor,
} from "@mantine/core";
import { socialSocket as socket } from "../../sockets/socialSocket.tsx";
import { useFriend } from "../../hooks/useFriend.tsx";
import { Link } from "react-router";
import { getAvatarSrc } from "../utils/avatar";

export function FriendList() {
  const friends = useFriend();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
    setActionSuccess(null);
    setActionSuccess(null);
    try {
      socket.emit("friend:remove", friendId);
    } catch {
      setActionError("Could not remove friend, try again later.");
    }
  };

  const rows = friends.map((item) => (
    <Table.Tr key={item.id} w="100%" mah={0}>
      <Table.Td>
        <Anchor
          component={Link}
          to={`/profile/${encodeURIComponent(item.username)}`}
          underline="hover"
          fz="lg"
          fw={500}
          display="block"
        >
          <Group wrap="nowrap" gap="xs">
            <Avatar
              size={40}
              src={getAvatarSrc(item.avatar)}
              radius={40}
              alt=""
              style={{ flexShrink: 0 }}
            />
            <Text truncate="end" style={{ flex: 1, minWidth: 0 }}>
              {item.username.length > 15
                ? `${item.username.slice(0, 15)}...`
                : item.username}
            </Text>
          </Group>
        </Anchor>
      </Table.Td>
      <Table.Td w={1} style={{ whiteSpace: "nowrap" }}>
        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <Box
            w={8}
            h={8}
            bg={item.isOnline ? "green" : "gray"}
            style={{ borderRadius: "50%", flexShrink: 0 }}
          />
          <Text c={item.isOnline ? undefined : "dimmed"} ta="right">
            {item.isOnline ? "online" : "offline"}
          </Text>
        </Group>
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
      {actionSuccess && (
        <Text c="green" fz="sm" p="sm">
          {actionSuccess}
        </Text>
      )}
      <Box h={480} style={{ overflowY: "auto" }}>
        <Table
          verticalSpacing="md"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
}
