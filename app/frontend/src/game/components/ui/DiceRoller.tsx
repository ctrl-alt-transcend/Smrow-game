import { useState, useCallback, useRef } from 'react';
import { Card, Text, Stack, Title, Box } from '@mantine/core';
import { Dice3D, type Dice3DHandle, type DiceValue } from '../gameboard/Dice/Dice';
import { useGameBoard } from '../../contexts/GameBoardContext';
import { useRollDice, RollResponse } from '../../hooks/useRollDice';

export function DiceRoller() {
  const [rolledValue, setRolledValue] = useState<DiceValue | null>(null);
  const [pendingCheatValue, setPendingCheatValue] = useState<DiceValue | null>(null);
  const pendingResultRef = useRef<{ value: DiceValue | null; message: string | null } | null>(null);
  const { updateGamemasterLog } = useGameBoard();
  const { roll } = useRollDice();
  const diceRef = useRef<Dice3DHandle>(null);

  const handleRoll = useCallback(async () => {
    try {
      const result = await roll();
      if (!result) return;
      pendingResultRef.current = { value: result.value, message: result.message };
      setPendingCheatValue(result.value);
    } catch (err) {
      console.error('Failed to roll dice:', err);
      updateGamemasterLog('Error rolling dice');
    }
  }, [roll, updateGamemasterLog]);

  const handleAnimationComplete = useCallback((finalValue: DiceValue) => {
    setRolledValue(finalValue);
    const message =
    pendingResultRef.current?.message ?? `You rolled a ${finalValue}`;
    updateGamemasterLog(message);
    setPendingCheatValue(null)
  }, [updateGamemasterLog]);

  return (
    <Box style={{ flex: 1, minWidth: 220, alignContent: 'center' }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xs" align="center" justify="center">
          <Title order={4}>Dice box</Title>
          <Dice3D
            ref={diceRef}
            size={80}
            cheatValue={pendingCheatValue ?? undefined}
            onClick={handleRoll}
            onRoll={handleAnimationComplete}
            triggers={['click']}
          />
          <Text>
            {rolledValue !== null ? `You rolled a ${rolledValue}!` : 'Click the dice!'}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}
