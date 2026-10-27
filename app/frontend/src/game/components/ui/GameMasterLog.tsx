import { Box, Card, Text, Title, Stack } from '@mantine/core';

function GameMasterLogs({log} : {log: string | null }) {
  return (
    <Box style={{ flex: 1, minWidth: 80, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={80}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={6}>Game Master Logs</Title>
          <Text>
            { log }
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;
