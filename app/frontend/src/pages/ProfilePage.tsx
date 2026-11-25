import {
  Avatar,
  Divider,
  Grid,
  Paper,
  Box,
  Card,
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
      <Title order={1} mb="xl" ta="left" fz={{ base: "h3", md: "h1" }}>
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
              <Card withBorder shadow="xs" radius="md" p="sm">
                <Title order={4} mb="sm" ta="center">
                  Friends
                </Title>
                <Card.Section>
                  <Divider color="black" />
                </Card.Section>
                <Box pt="sm">
                  <FriendList />
                </Box>
              </Card>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Card withBorder shadow="xs" radius="md" p="sm">
                <Title order={4} mb="sm" ta="center">
                  Add friends
                </Title>
                <Card.Section>
                  <Divider color="black" />
                </Card.Section>
                <Text c="dimmed" size="sm" mt="sm" mb="md">
                  Search for a user and send them a friend request.
                </Text>
                <AddFriend />
              </Card>

              <Card withBorder shadow="xs" radius="md" p="sm">
                <Title order={4} mb="sm" ta="center">
                  Pending requests
                </Title>
                <Card.Section>
                  <Divider color="black" />
                </Card.Section>
                <Box pt="sm">
                  <PendingList />
                </Box>
              </Card>
            </SimpleGrid>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
