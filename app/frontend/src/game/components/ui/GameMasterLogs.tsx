import { Box, Card, Text, Title, Stack } from '@mantine/core';
import useGamemasterLogs from '../../hooks/useGamemasterLogs';

function GameMasterLogs({ controller }: { controller: string }) {
  const { data, error, loading } = useGamemasterLogs(controller);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error fetching data: {error}</p>;
  return (
    <Box style={{ flex: 1, minWidth: 80, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={80}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={6}>Game Master Logs</Title>
          <Text>
            { data }
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;