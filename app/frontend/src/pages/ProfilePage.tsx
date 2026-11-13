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
              <Avatar
                src={user?.avatarURL}
                size={"200"}
                radius="md"
                color="Red"
              />
              <Title order={3}>{user?.username}</Title>
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
