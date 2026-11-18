import { IconMinus } from "@tabler/icons-react";
import { ActionIcon, Avatar, Group, Table, Text, Loader } from "@mantine/core";
// import { useAuth } from "../../hooks/useAuth";
import { useFetch } from "../../hooks/useFetch";
import { getFriendList } from "../../services/user.service";
import ErrorMessages from "../utils/ErrorMessages";
// import { fireEvent } from "@testing-library/react";

export function FriendList() {
  // const { user } = useAuth();
  const friendlist = useFetch(getFriendList);

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
        Empty
      </Text>
    );
  }

  const rows = friendlist.data.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={40} src={item.avatar} radius={40} alt="" />
          <Text fz="sm" fw={500}>
            {item.username}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fz="sm" c="dimmed">
          Bio
        </Text>
        <Text fz="sm">{item.bio ?? "-"}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="red" aria-label="Remove friend">
            <IconMinus size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="md">
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
