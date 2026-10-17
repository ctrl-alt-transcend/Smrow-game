import { Box, Card, Text, Title, Stack } from '@mantine/core';
import { useGameBoard } from '../../contexts/GameBoardContext';

function GameMasterLogs() {
  const { gamemasterlog } = useGameBoard();

  return (
    <Box style={{ flex: 1, minWidth: 80, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={80}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={6}>Game Master Logs</Title>
          <Text>
            { gamemasterlog }
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;