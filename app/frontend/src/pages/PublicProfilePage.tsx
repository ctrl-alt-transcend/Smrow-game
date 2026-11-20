import { Alert, Loader, Paper, Title } from "@mantine/core";
import { useParams } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
import { useCallback } from "react";
import { useFetch } from "../hooks/useFetch";
import { fetchPublicProfile } from "../services/user.service";
// import { getAvatarSrc } from "../components/utils/avatar";

export default function PublicProfilePage() {
  const { username = "" } = useParams();
  // const { user: me } = useAuth();

  const fetcher = useCallback(() => fetchPublicProfile(username), [username]);
  const { data: profile, error, loading } = useFetch(fetcher);

  if (loading) return <Loader />;

  if (error || !profile)
    return <Alert color="gray" title="Profile not found" />;

  return (
    <Paper>
      <Title mb="xl" ta="center">
        Profile
      </Title>
      username: {profile.username};
    </Paper>
  );
}
