import {
  Avatar,
  Divider,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <Title mb="xl" ta="center">
        Profile
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" h="100%">
            <Stack align="center" gap="xs">
              <Avatar size={120} radius="md" color="Red">
                MG
              </Avatar>
              <Title order={3}>{user?.username}</Title>
            </Stack>

            <Divider my="md" />

            <Stack gap="sm" style={{ overflowWrap: "anywhere" }}>
              <Paper withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed">
                  Username
                </Text>
                <Text>{user?.username}</Text>
              </Paper>

              <Paper withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed">
                  Email
                </Text>
                <Text>{user?.email}</Text>
              </Paper>

              <Paper withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed">
                  Member since
                </Text>
                <Text>{user?.createdAt}</Text>
              </Paper>

              <Paper withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed">
                  Bio
                </Text>
                <Text>{user?.bio}</Text>
              </Paper>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" mih={400} h="100%">
            <Title order={3} mb="md">
              Friends
            </Title>
            <Text c="dimmed" ta="center" py="xl">
              No friend yet ..
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
