import {
  Avatar,
  Divider,
  Grid,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { FriendList } from "../components/social/FriendList";
import { useAuth } from "../hooks/useAuth";
import { ProfileForm } from "../components/form/ProfileForm";
import { ProfilePictureUpload } from "../components/form/ProfilePictureUpload";
import { getAvatarSrc } from "../components/utils/avatar";
import { AddFriend } from "../components/form/AddFriend";
import { PendingList } from "../components/social/PendingList";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <Title order={1} mb="xl" ta="center" fz={{ base: "h3", md: "h1" }}>
        Profile
      </Title>

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder shadow="xs" radius="md" p="lg" h="100%">
            <Stack align="center" gap="md">
              <Avatar
                src={getAvatarSrc(user?.avatarURL)}
                size={160}
                radius="md"
                color="red"
              />
              <Title
                order={2}
                ta="center"
                maw="100%"
                lineClamp={2}
                title={user?.username}
              >
                {user?.username}
              </Title>
              {user && <ProfilePictureUpload user={user} />}
            </Stack>

            <Divider my="lg" label="Settings" labelPosition="center" />

            {user && <ProfileForm user={user} />}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg" h="100%">
            <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
              <Paper withBorder shadow="xs" radius="md" p="lg">
                <Title order={4} mb="md">
                  Friends
                </Title>
                <FriendList />
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Paper withBorder shadow="xs" radius="md" p="lg">
                <Title order={4} mb="xs">
                  Add friends
                </Title>
                <Text c="dimmed" size="sm" mb="md">
                  Search for a user and send them a friend request.
                </Text>
                <AddFriend />
              </Paper>

              <Paper withBorder shadow="xs" radius="md" p="lg">
                <Title order={4} mb="md">
                  Pending requests
                </Title>
                <PendingList />
              </Paper>
            </SimpleGrid>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
