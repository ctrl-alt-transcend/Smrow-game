import { Avatar, Divider, Grid, Paper, Stack, Title } from "@mantine/core";
import { FriendList } from "../components/social/FriendList";
import { useAuth } from "../hooks/useAuth";
import { ProfileSettings } from "../components/form/ProfileForm";
import { ProfilePictureUpload } from "../components/form/ProfilePictureUpload";
import { getAvatarSrc } from "../components/utils/avatar";
import { AddFriend } from "../components/form/AddFriend";

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
            <Title ta={"center"}>{user?.username}</Title>

            <Divider my="md" />
            <Stack align="center" justify="space-between" gap="xs">
              <Avatar
                src={getAvatarSrc(user?.avatarURL)}
                size={"200"}
                radius="md"
                color="Red"
                mb={"md"}
              />
              <ProfilePictureUpload />
            </Stack>
            <Divider my="md" />

            <ProfileSettings />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper>
            <Title>Add Friends !</Title>
            <AddFriend />
          </Paper>
          <Paper withBorder p="md" mih={400} h="100%">
            <Title order={3} mb="md">
              Friends
            </Title>
            <FriendList />
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
