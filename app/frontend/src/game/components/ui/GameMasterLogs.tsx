//import { useState, useEffect } from 'react';
import { Box, Card, Text, Title, Stack } from '@mantine/core';

function GameMasterLogs() {
  //const [data, setData] = useState(null)
  //const [loading, setLoading] = useState(true)
  //const [error, setError] = useState(null)

  //useEffect(() => {
  //  const fetchData = async () => {
  //    try {
  //      const response = await fetch('/api/gamemaster/gamemasterGreetings')
  //      const result = await response.json()
  //      setData(result)
  //    } catch (error) {
  //      setError(error)
  //    } finally {
  //      setLoading(false)
  //    }
  //  }
  //  fetchData()
  //}, [])
  //if (loading) {
  //  return <p>Loading data...</p>
  //}
  //if (error) {
  //  return <p>Error fetching data: {error}</p>
  //}

  return (
    <Box style={{ flex: 1, minWidth: 80, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={80}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={6}>Game Master Logs</Title>
          <Text>
            {/*{ data.message }*/}
            log ...
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;