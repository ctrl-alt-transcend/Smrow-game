import { useState, useCallback, useRef } from 'react';
import { Card, Stack, Title, Box } from '@mantine/core';
import { Dice3D, type DiceValue } from '../gameboard/Dice/Dice';
import { useGameBoard } from '../../contexts/GameBoardContext';
import { useRollDice } from '../../hooks/useRollDice';


export function DiceRoller({diceValue, masterLog}: { diceValue: number | null ; masterLog: string | null }) {
  const [rolledValue, setRolledValue] = useState<DiceValue | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingResultRef = useRef<{ value: DiceValue | number | null; message: string | null} | null>(null);
  const { updateGamemasterLog } = useGameBoard();
  const { roll } = useRollDice();


  const handleRollRequest = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await roll();
      setBusy(false);
      if(diceValue === null) {
        if(masterLog)
          updateGamemasterLog(masterLog);
        setBusy(false);
        return;
      }
      pendingResultRef.current = { value: diceValue, message: masterLog };
      setRolledValue(diceValue);
    } catch (err) {
      console.error('Failed to roll dice:', err);
      updateGamemasterLog('Error rolling dice');
      setBusy(false);
    }
  }, [roll, updateGamemasterLog, busy]);

  const handleAnimationComplete = useCallback(
    (finalValue: DiceValue) => {
      const value = pendingResultRef.current?.value ?? finalValue;
      const message = pendingResultRef.current?.message ?? `You rolled a ${value}`;
      setRolledValue(value);
      updateGamemasterLog(message);
      pendingResultRef.current = null;
      setRolledValue(null);
      setBusy(false);
    },
    [updateGamemasterLog]
  );

  return (
    <Box style={{ flex: 1, minWidth: 220, position: 'relative' }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xl" align="center" justify="center">
          <Title order={4}>Dice box</Title>
          <Dice3D
            size={80}
            cheatValue={rolledValue ?? undefined}
            onRoll={handleAnimationComplete}
            triggers={[]}
            style={{ pointerEvents: 'none' }}
          />
        </Stack>
      </Card>
      <button
        type="button"
        onClick={handleRollRequest}
        disabled={busy}
        aria-label="Roll the dice"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          borderRadius: 8,
          cursor: busy ? 'wait' : 'pointer',
        }}
      />
    </Box>
  );
}
