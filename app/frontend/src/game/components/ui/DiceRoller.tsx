import { useState, useCallback, useRef } from 'react';
import { Card, Text, Stack, Title, Box } from '@mantine/core';
import { Dice3D, type Dice3DHandle, type DiceValue } from '../gameboard/Dice/Dice';
import { useGameBoard } from '../../contexts/GameBoardContext';
import { useRollDice } from '../../hooks/useRollDice';

export function DiceRoller() {
  const [pendingCheatValue, setPendingCheatValue] = useState<DiceValue | null>(null);
  const [rolledValue, setRolledValue] = useState<DiceValue | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingResultRef = useRef<{ value: DiceValue | number | null; message: string | null} | null>(null);
  const { updateGamemasterLog } = useGameBoard();
  const { roll } = useRollDice();

  const handleRollRequest = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await roll();
      if (!result) {
        setBusy(false);
        return;
      }
      if(result.value === null) {
        if(result.message)
          updateGamemasterLog(result.message);
        setBusy(false);
        return;
      }

      pendingResultRef.current = { value: result.value, message: result.message };
      setPendingCheatValue(result.value);
      console.log(`front:DiceRoller:server value: ${result.value}`);
    } catch (err) {
      console.error('Failed to roll dice:', err);
      updateGamemasterLog('Error rolling dice');
      setBusy(false);
    }
  }, [roll, updateGamemasterLog, busy]);

  const handleAnimationComplete = useCallback(
    (finalValue: DiceValue) => {
      const server = pendingResultRef.current;

      // La valeur serveur prime ; `finalValue` n'est qu'un filet de sécurité
      const value = server?.value ?? finalValue;
      const message = server?.message ?? `You rolled a ${value}`;

      setRolledValue(value);
      updateGamemasterLog(message);
      console.log(`front:DiceRoller:displayed value: ${value}`);

      pendingResultRef.current = null;
      setPendingCheatValue(null); // reset → autorise le prochain lancer
      setBusy(false);
    },
    [updateGamemasterLog]
  );

  return (
    <Box style={{ flex: 1, minWidth: 220, position: 'relative' }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xs" align="center" justify="center">
          <Title order={4}>Dice box</Title>
          <Dice3D
            size={80}
            cheatValue={pendingCheatValue ?? undefined}
            onRoll={handleAnimationComplete}
            triggers={[]}
            style={{ pointerEvents: 'none' }}
          />

          <Text>
            {rolledValue !== null ? `You rolled a ${rolledValue}!` : 'Click the dice!'}
          </Text>
        </Stack>
      </Card>
      <button
        type="button"
        onClick={handleRollRequest}
        disabled={busy}
        aria-label="Lancer les dés"
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