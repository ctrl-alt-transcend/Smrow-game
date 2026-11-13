import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Stack, Title, Box } from "@mantine/core";
import {
  Dice3D,
  type Dice3DHandle,
  type DiceValue,
} from "../gameboard/Dice/Dice";
import { gameSocket as socket } from "../../../sockets/gameSocket";
import type { DiceRoll } from "shared";

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
  currentRoll: DiceRoll;
  isMyTurn: boolean;
}) {
  const [busy, setBusy] = useState(false);

  const [handledRoll, setHandledRoll] = useState<DiceRoll>(currentRoll);

  const rollPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const diceRef = useRef<Dice3DHandle>(null);

  const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

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

  if (currentRoll.id !== handledRoll.id) {
    setHandledRoll(currentRoll);
    if (!isDiceValue(currentRoll.val)) {
      setBusy(false);
    }
  }
  if (locked && busy) {
    setBusy(false);
  }

  const handleDiceRequest = useCallback(() => {
    if (busy || !isMyTurn) return;
    rollPendingRef.current = true;
    setBusy(true);
    socket.emit("dice");
    timeoutRef.current = window.setTimeout(unlock, SERVER_TIMEOUT_MS);
  }, [busy, isMyTurn, unlock]);

  useEffect(() => {
    if (!rollPendingRef.current || !isDiceValue(currentRoll.val)) return;
    rollPendingRef.current = false;
    diceRef.current?.rollDice(currentRoll.val);
  }, [currentRoll.id, currentRoll.val]);

  useEffect(() => {
    if (!isDiceValue(currentRoll.val)) {
      clearServerTimeout();
      rollPendingRef.current = false;
    }
  }, [currentRoll.id, currentRoll.val, clearServerTimeout]);

  const handleAnimationComplete = useCallback(() => {
    unlock();
  }, [unlock]);

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
