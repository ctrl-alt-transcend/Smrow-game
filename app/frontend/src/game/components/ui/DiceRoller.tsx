import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Stack, Title, Box } from '@mantine/core';
import { Dice3D, type Dice3DHandle, type DiceValue } from '../gameboard/Dice/Dice';
import { socket } from '../../../socket';

const SERVER_TIMEOUT_MS = 2000;

function isDiceValue(n: unknown): n is DiceValue {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 6;
}

/**
* Measures the container width to adjust the size of the die (responsive).
*/
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export function DiceRoller({ currentRoll, isMyTurn}: { currentRoll: number | null, isMyTurn: boolean }) {
  const [busy, setBusy] = useState(false);

/**
* `waiting`: 'dice' has been emitted, and we are awaiting the server's decision
* (or the animation is in progress).
*/
  const waitingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const diceRef = useRef<Dice3DHandle>(null);

  const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

/**
* Dice size: constrained between 48 and 96 px, depending on the available width.
* const diceSize = Math.round(Math.max(48, Math.min(96, (width - 64) / 2)));
*/
  const diceSize = Math.round(Math.max(48, Math.min(96, (width - 64) / 2)));
  const clearServerTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const unlock = useCallback(() => {
    waitingRef.current = false;
    setBusy(false);
  }, []);

/** 1. Click → the request is sent to the server. */
  const handleDiceRequest = useCallback(() => {
    if (busy || !isMyTurn) return;
    waitingRef.current = true;
    setBusy(true);
    socket.emit('dice');
    timeoutRef.current = window.setTimeout(unlock, SERVER_TIMEOUT_MS);
  }, [busy, unlock]);

/**
* 2. Server response → arrives via the `currentRoll` prop.
* 1..6: trigger the animation via the Dice3D reference (forced value).
* null: invalid move → nothing changes; we unblock.
*/
  useEffect(() => {
    if (!waitingRef.current) return;

    if (isDiceValue(currentRoll)) {
      diceRef.current?.rollDice(currentRoll);
    } else {
      clearServerTimeout();
      unlock();
    }
  }, [currentRoll, clearServerTimeout, unlock]);

/** 3. End of animation → Dice3D is already displaying the final face; unlock it. */
  const handleAnimationComplete = useCallback(() => {
    if (!waitingRef.current) return;
    clearServerTimeout();
    unlock();
  }, [clearServerTimeout, unlock]);

  useEffect(() => clearServerTimeout, [clearServerTimeout]);

  return (
    <Box
      ref={containerRef}
      style={{ flex: 1, minWidth: 220, width: '100%', position: 'relative' }}
    >
      <Card
        withBorder
        radius="md"
        shadow="sm"
        mih={150}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Stack gap="xs" align="center" justify="center" w="100%">
          <Title order={4}>Dice box</Title>
          <Dice3D
            ref={diceRef}
            size={diceSize}
            onRoll={handleAnimationComplete}
            triggers={[]}
            style={{ pointerEvents: 'none' }}
          />
        </Stack>
      </Card>
      <button
        type="button"
        onClick={handleDiceRequest}
        disabled={busy || !isMyTurn}
        aria-label="Roll the dice"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          border: 'none',
          borderRadius: 8,
          background: !isMyTurn ? 'rgba(109, 109, 109, 0.35)' : 'transparent',
          backdropFilter: !isMyTurn ? 'grayscale(80%)' : undefined,
          cursor: !isMyTurn ? 'not-allowed' : 'pointer',
        }}
      />
    </Box>
  );
}
