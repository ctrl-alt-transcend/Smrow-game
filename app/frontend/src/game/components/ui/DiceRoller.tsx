import { useState } from 'react';
import { Card, Text, Stack, Title, Box } from '@mantine/core';
import Dice3D from '../gameboard/Dice/Dice';

export function DiceRoller() {
  const [rolledValue, setRolledValue] = useState<number | null>(null);

  const handleRoll = (value: number) => {
    setRolledValue(value);
  };

  return (
    <Box style={{ flex: 1, minWidth: 220, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xs" align="center" justify='center'>
          <Title order={4}>Dice box</Title>
            <Dice3D onRoll={handleRoll} size={80}/>
            <Text>
              {rolledValue !== null ? `You rolled a ${rolledValue}!` : 'Roll the dice!'}
            </Text>
        </Stack>
      </Card>
    </Box>
  );
}