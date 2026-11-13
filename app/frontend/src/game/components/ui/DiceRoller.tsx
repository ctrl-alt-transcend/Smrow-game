import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Stack, Title, Box } from "@mantine/core";
import {
  Dice3D,
  type Dice3DHandle,
  type DiceValue,
} from "../gameboard/Dice/Dice";
import { gameSocket as socket } from "../../../sockets/gameSocket";

/** Safety timeout: if the server never answers, unlock the UI. */
const SERVER_TIMEOUT_MS = 5000;

function isDiceValue(n: unknown): n is DiceValue {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 6;
}

/**
 * Measures the container width to adapt the dice size (responsive).
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

export function DiceRoller({
  currentRoll,
  isMyTurn,
}: {
  currentRoll: number | null;
  isMyTurn: boolean;
}) {
  // `busy` IS the waiting flag: true from the click until the server
  // has answered AND the animation is done. Render state (drives the
  // overlay/cursor/guard) — never a ref.
  const [busy, setBusy] = useState(false);

  // Last roll value this component already reacted to. Updated during
  // render (React-endorsed "adjust state when a prop changes" pattern):
  // handles the null/invalid case with plain state updates only.
  const [handledRoll, setHandledRoll] = useState<number | null>(currentRoll);

  // True between `socket.emit('dice')` and the consumption of the
  // server's answer. Written in the click handler, consumed in the
  // animation effect. IMPORTANT: the animation effect depends on
  // `currentRoll` ONLY — adding `busy` would re-run it on click with
  // the STALE previous roll and animate before the server answers.
  const rollPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const diceRef = useRef<Dice3DHandle>(null);

  const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

  // Dice size: bounded between 48 and 96 px depending on available width.
  const diceSize = Math.round(Math.max(48, Math.min(96, (width - 64) / 2)));

  const locked = !isMyTurn;

  const clearServerTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const unlock = useCallback(() => {
    clearServerTimeout();
    setBusy(false);
  }, [clearServerTimeout]);

  /* Render-phase adjustments — plain state updates only, NO refs here
   * (the linter forbids touching refs during render):
   * 1. A NEW server answer arrived and is null/invalid → stop waiting
   *    immediately (the animation effect ignores null anyway).
   * 2. Our turn ended while we were waiting → abort cleanly. */
  if (currentRoll !== handledRoll) {
    setHandledRoll(currentRoll);
    if (!isDiceValue(currentRoll)) {
      setBusy(false);
    }
  }
  if (locked && busy) {
    setBusy(false);
  }

  // 1. Click → the request is sent to the server. (Event handler:
  // writing refs and setState are both fine here.)
  const handleDiceRequest = useCallback(() => {
    if (busy || !isMyTurn) return;
    rollPendingRef.current = true;
    setBusy(true);
    socket.emit("dice");
    // Safety: if the server never answers, unlock the UI.
    timeoutRef.current = window.setTimeout(unlock, SERVER_TIMEOUT_MS);
  }, [busy, isMyTurn, unlock]);

  // 2. Server answer → animation, ONLY when the roll value changes.
  // Deps are [currentRoll] on purpose: this effect must NOT re-run on
  // `busy` toggles, otherwise the stale previous roll animates on click.
  // Refs are read/written inside the effect, which the linter allows.
  useEffect(() => {
    if (!rollPendingRef.current || !isDiceValue(currentRoll)) return;
    rollPendingRef.current = false;
    diceRef.current?.rollDice(currentRoll);
    // `busy` stays true: unlock happens in handleAnimationComplete.
  }, [currentRoll]);

  // 3. Null/invalid answer → release the safety timer and the pending
  // flag. (Ref access inside an effect only — no setState.)
  useEffect(() => {
    if (!isDiceValue(currentRoll)) {
      clearServerTimeout();
      rollPendingRef.current = false;
    }
  }, [currentRoll, clearServerTimeout]);

  // 4. End of animation → Dice3D already displays the final face; unlock.
  // Called from Dice3D's completion callback (outside render): setState
  // is fine here.
  const handleAnimationComplete = useCallback(() => {
    unlock();
  }, [unlock]);

  // Cleanup on unmount.
  useEffect(() => clearServerTimeout, [clearServerTimeout]);

  return (
    <Box
      ref={containerRef}
      style={{ flex: 1, minWidth: 220, width: "100%", position: "relative" }}
    >
      <Card
        withBorder
        radius="md"
        shadow="sm"
        mih={150}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack gap="xs" align="center" justify="center" w="100%">
          <Title order={4}>Dice box</Title>
          <Dice3D
            ref={diceRef}
            size={diceSize}
            onRoll={handleAnimationComplete}
            triggers={[]}
            style={{ pointerEvents: "none" }}
          />
        </Stack>
      </Card>
      {/* Overlay: captures clicks on our turn; grey veil otherwise. */}
      <button
        type="button"
        onClick={handleDiceRequest}
        disabled={locked}
        aria-label={locked ? "Not your turn" : "Roll the dice"}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          border: "none",
          borderRadius: 8,
          background: locked ? "rgba(109, 109, 109, 0.35)" : "transparent",
          backdropFilter: locked ? "grayscale(80%)" : undefined,
          cursor: locked ? "not-allowed" : busy ? "wait" : "pointer",
        }}
      />
    </Box>
  );
}
