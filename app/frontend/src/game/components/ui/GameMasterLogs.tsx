import { useState, useEffect } from 'react';
import { Box, Card, Text, Title, Stack } from '@mantine/core';

function GameMasterLogs() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5173/game')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error:', error));
  }, []);

  return (

    <Box style={{ flex: 1, minWidth: 100, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={100}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={4}>Game Master Logs</Title>
          <Text>
            {message}
            {/*{'Hello'}*/}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;