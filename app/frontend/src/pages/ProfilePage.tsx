import {
  Avatar,
  Divider,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
  Image,
} from "@mantine/core";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  console.log("url: ", user?.avatarURL);
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
                <Image
                  radius="md"
                  h={200}
                  w="auto"
                  fit="contain"
                  src={user?.avatarURL}
                  fallbackSrc="/missing.png"
                />
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
                  image url
                </Text>
                <Text>{user?.avatarURL}</Text>
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
