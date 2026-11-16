import { Grid, Title } from "@mantine/core";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import {
  getLeaderboard,
  getMyMatchHistory,
  getMyStats,
} from "../services/stats.service";
import StatsSection from "../components/stats/StatsSection";
import StatsSummary from "../components/stats/StatsSummary";
import AchievementList from "../components/stats/AchievementList";
import MatchHistory from "../components/stats/MatchHistory";
import Leaderboard from "../components/stats/Leaderboard";

function StatsPage() {
  const { user } = useAuth();
  const stats = useFetch(getMyStats);
  const history = useFetch(getMyMatchHistory);
  const leaderboard = useFetch(getLeaderboard);

  return (
    <>
      <Title mb="xl" ta="center">
        Stats
      </Title>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <StatsSection
            title="Overview"
            loading={stats.loading}
            error={stats.error}
          >
            {stats.data && <StatsSummary stats={stats.data} />}
          </StatsSection>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <StatsSection
            title="Achievements"
            loading={stats.loading}
            error={stats.error}
          >
            {stats.data && (
              <AchievementList achievements={stats.data.achievements} />
            )}
          </StatsSection>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <StatsSection
            title="Match history"
            loading={history.loading}
            error={history.error}
            empty={history.data?.length === 0}
            emptyText="No game played yet .."
          >
            {history.data && <MatchHistory matches={history.data} />}
          </StatsSection>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <StatsSection
            title="Leaderboard"
            loading={leaderboard.loading}
            error={leaderboard.error}
            empty={leaderboard.data?.length === 0}
            emptyText="Nobody won a game yet .."
          >
            {leaderboard.data && (
              <Leaderboard
                entries={leaderboard.data}
                currentUserId={user?.id}
              />
            )}
          </StatsSection>
        </Grid.Col>
      </Grid>
    </>
  );
}

export default StatsPage;
