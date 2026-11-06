import { useState, useCallback, useRef } from 'react';
import { Card, Stack, Title, Box } from '@mantine/core';
import { Dice3D, type DiceValue } from '../gameboard/Dice/Dice';
//import { useRollDice } from '../../hooks/useRollDice';
import type { GameResponse } from '@shared/game/game.types';
import { socket } from '../../../socket';


export function DiceRoller({diceRoll, masterLog}: { diceRoll: number | null ; masterLog: string | null }) {
  const [rolledValue, setRolledValue] = useState<DiceValue | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingResultRef = useRef<GameResponse | null>(null);
  //const { roll } = useRollDice();

  const handleRollRequest = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      socket.emit('dice');

      //await roll();
      setBusy(false);
      if(diceRoll === null) {
        setBusy(false);
        return;
      }
      pendingResultRef.current = { value: diceRoll, message: masterLog, data: null };
      setRolledValue(diceRoll);
    } catch (err) {
      console.error('Failed to roll dice:', err);
      setBusy(false);
    }
  }, [busy, masterLog, diceRoll]);
  //}, [roll, busy, masterLog, diceRoll]);

  const handleAnimationComplete = useCallback(
    (finalValue: DiceValue) => {
      const value = pendingResultRef.current?.value ?? finalValue;
      setRolledValue(value);
      pendingResultRef.current = null;
      setRolledValue(null);
      setBusy(false);
    }, []
  );

  return (
    <Box style={{ flex: 1, minWidth: 220, position: 'relative' }}>
      <Card withBorder radius="md" shadow="sm" h={150}>
        <Stack gap="xs" align="center" justify="center">
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
