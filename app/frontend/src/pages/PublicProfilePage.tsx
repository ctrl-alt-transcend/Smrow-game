import {
  Alert,
  Loader,
  Paper,
  Title,
  Stack,
  Avatar,
  Text,
  Divider,
} from "@mantine/core";
import { useParams } from "react-router";
import { useCallback } from "react";
import { useFetch } from "../hooks/useFetch";
import { fetchPublicProfile } from "../services/user.service";
import { getAvatarSrc } from "../components/utils/avatar";

export default function PublicProfilePage() {
  const { username = "" } = useParams();

  const fetcher = useCallback(() => fetchPublicProfile(username), [username]);
  const { data: profile, error, loading } = useFetch(fetcher);

  if (loading) return <Loader />;

  if (error || !profile)
    return <Alert color="gray" title="Profile not found" />;

  return (
    <>
      <Title order={1} mb="xl" ta="center">
        Profile
      </Title>

      <Paper withBorder shadow="xs" radius="md" p="lg" maw={500} mx="auto">
        <Stack align="center" gap="md">
          <Avatar
            src={getAvatarSrc(profile.avatar)}
            size={160}
            radius="md"
            color="red"
          />
          <Title
            order={2}
            ta="center"
            maw="100%"
            lineClamp={2}
            title={profile?.username}
          >
            {profile.username}
          </Title>
          <Text c="dimmed">{profile.name}</Text>
        </Stack>

        <Divider my="lg" label="About" labelPosition="center" />

        <Stack gap="xs">
          <Text fz="sm" c="dimmed">
            Bio
          </Text>
          <Text>{profile.bio ?? "-"}</Text>

          <Text fz="sm" c="dimmed" mt="md">
            Member since
          </Text>
          <Text>{new Date(profile.createdAt).toLocaleDateString()}</Text>
        </Stack>
      </Paper>
    </>
  );
}
