import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Stack, Title, Box, Text } from "@mantine/core";
import {
  Dice3D,
  type Dice3DHandle,
  type DiceValue,
} from "../gameboard/Dice/Dice";
import { gameSocket as socket } from "../../../sockets/gameSocket";
import { type DiceRoll } from "shared";
import useElementWidth from "../../hooks/useElementWidth";

/** Safety timeout: if the server never answers, unlock the UI. */
const SERVER_TIMEOUT_MS = 2000;

function isDiceValue(n: unknown): n is DiceValue {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 6;
}

export function DiceRoller({
  title,
  currentRoll,
  firstDice = 0,
  secondDice = 0,
  isMyTurn,
  disabled = false,
  theme = "default",
}: {
  title: string;
  currentRoll: DiceRoll;
  firstDice?: number;
  secondDice?: number;
  isMyTurn: boolean;
  /** Blocking conditions computed by the caller (phase gating, limits...) */
  disabled?: boolean;
  /** "default": short flash on each new roll. "magic": persistent violet glow. */
  theme?: "default" | "magic";
}) {
  const [busy, setBusy] = useState(false);
  /**
   * Id of the roll currently flashing. Derived-state pattern: adjusted
   * during render (allowed by React), never inside an effect.
   */
  const [flashRollId, setFlashRollId] = useState<number | null>(null);

  /** Last roll id already animated. null so an id-0 roll is not swallowed. */
  const handledRollIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const diceRef = useRef<Dice3DHandle>(null);

  const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

  const diceSize = Math.round(Math.max(48, Math.min(96, (width - 64) / 2)));
  const locked = disabled || !isMyTurn;

  // --- Derived state, adjusted during render (React-sanctioned pattern) ---

  // New roll arrived -> remember it to trigger the flash animation.
  if (
    theme === "default" &&
    isDiceValue(currentRoll.val) &&
    currentRoll.id !== flashRollId
  ) {
    setFlashRollId(currentRoll.id);
  }
  const flashOn = theme === "default" && flashRollId === currentRoll.id;

  // Invalid roll value -> unlock by safety (render-time, like below).
  if (!isDiceValue(currentRoll.val) && busy) setBusy(false);
  if (locked && busy) setBusy(false);

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

  // ✨ Animation for EVERYONE: any client receiving a NEW roll id animates.
  // No setState here, only the ref access -> React Compiler compliant.
  useEffect(() => {
    if (currentRoll.val === null) return; // nothing to animate yet
    if (currentRoll.id === handledRollIdRef.current) return; // already handled
    handledRollIdRef.current = currentRoll.id;
    if (isDiceValue(currentRoll.val)) {
      diceRef.current?.rollDice(currentRoll.val);
    }
  }, [currentRoll.id, currentRoll.val]);

  const handleDiceRequest = useCallback(() => {
    if (busy || locked) return;
    setBusy(true);
    socket.emit("game:dice");
    timeoutRef.current = window.setTimeout(unlock, SERVER_TIMEOUT_MS);
  }, [busy, locked, unlock]);

  const handleAnimationComplete = useCallback(() => {
    unlock();
  }, [unlock]);

  useEffect(() => clearServerTimeout, [clearServerTimeout]);

  const effectStyle =
    theme === "magic"
      ? { animation: "magicDiceGlow 3s ease-in-out infinite" }
      : flashOn
        ? { animation: "diceFlash 0.9s ease" }
        : undefined;

  let total: number = 0;
  if (firstDice && secondDice) total = firstDice + secondDice;

  return (
    <Box
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      <Card
        withBorder
        radius="md"
        shadow="sm"
        padding="sm"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Stack gap="xs" align="center" justify="center" w="100%">
          <Title order={4}>{title}</Title>
          <Box
            style={effectStyle}
            onAnimationEnd={() => {
              // Event handler, not an effect: setState allowed here.
              if (flashRollId === currentRoll.id) setFlashRollId(null);
            }}
          >
            <Dice3D
              ref={diceRef}
              size={diceSize}
              onRoll={handleAnimationComplete}
              triggers={[]}
              style={{ pointerEvents: "none" }}
            />
          </Box>
          {total ? <Text>You rolled «{total}» in total!</Text> : null}
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
