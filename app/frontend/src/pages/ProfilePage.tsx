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
import { ProfileSettings } from "../components/form/ProfileForm";
import { ProfilePictureUpload } from "../components/form/ProfilePictureUpload";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <Title mb="xl" ta="center">
        Profile
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          
          <Paper withBorder p="md" h="100%" >

            <Title ta={"center"}>{user?.username}</Title>

            <Divider my="md"/>

            <Stack align="center" justify="space-between" gap="xs">

              <Avatar
                src={user?.avatarURL}
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
