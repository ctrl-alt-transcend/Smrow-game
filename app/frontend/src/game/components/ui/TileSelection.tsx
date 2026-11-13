import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useSelectionDisplay } from "../../hooks/useSelectionDisplay";
import type { GameBoardSelection } from "../../types/gameboard.types";
import { Faction } from "@shared/game/gameboard.types.ts";
import type { BuildRequestPayload } from "@shared/game/game.types.ts";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";

interface PendingBuild {
  target: BuildRequestPayload;
  logAtSend: string | null;
}
const BUILD_TIMEOUT_MS = 500;

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  faction: Faction;
  masterLog: string | null;
  onBuilt?: (target: BuildRequestPayload) => void;
}

const BuildSelectionButton: React.FC<BuildSelectionButtonProps> = ({
  selected,
  faction,
  masterLog,
  onBuilt,
}) => {
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<PendingBuild | null>(null);

  const target = useMemo<BuildRequestPayload | null>(() => {
    if (selected.selectedRoad) {
      return {
        kind: "road",
        id: selected.selectedRoad.edge.id,
        data: selected.selectedRoad,
      };
    }
    if (selected.selectedSettlement) {
      return {
        kind: "settlement",
        id: selected.selectedSettlement.vertex.id,
        data: selected.selectedSettlement,
      };
    }
    return null;
  }, [selected.selectedRoad, selected.selectedSettlement]);

  /**
   * 1. Save the "build intention" and lock the component
   */
  const handleConfirm = useCallback(() => {
    if (busy || !target) return;
    pendingRef.current = { target, logAtSend: masterLog };
    setBusy(true);
    socket.emit("build", {
      kind: target.kind,
      id: target.id,
      data: target.data,
      faction: faction ?? Faction.DEFAULT,
    });
  }, [busy, target, masterLog, faction]);

  /**
   * 2. Unlock component at response reception
   */
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const serverAnswered = masterLog !== pending.logAtSend;
    if (!serverAnswered) return;

    pendingRef.current = null;
    setBusy(false);
    onBuilt?.(pending.target);
  }, [masterLog, onBuilt]);

  /**
   * 3. Anti-blocking guard if server deosn't respond
   */
  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => {
      if (!pendingRef.current) return;
      pendingRef.current = null;
      setBusy(false);
      console.warn("Build: no event during elapsed time");
    }, BUILD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [busy]);

  const openModal = () => {
    if (!target) {
      modals.openConfirmModal({
        title: "Pick a valid construction location",
        labels: { confirm: "OK", cancel: "Cancel" },
        centered: true,
      });
      return;
    }

    modals.openConfirmModal({
      title: "Confirm construction",
      children: (
        <Text size="sm">
          Are you sure you want to build:{" "}
          <Anchor
            href="#"
            onClick={(event) => {
              event.preventDefault();
              console.log(`Build ${target.kind} at:`, target.id);
            }}
          >
            {target.kind === "road" ? "Road" : "Settlement"} ({target.id})
          </Anchor>
          ?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: handleConfirm,
      centered: true,
    });
  };

  return (
    <Button onClick={openModal} loading={busy} disabled={busy}>
      Build selection
    </Button>
  );
};

interface TileSelectionProps {
  selected: GameBoardSelection;
  faction?: Faction;
  masterLog?: string | null;
  onBuilt?: (target: BuildRequestPayload) => void;
}

export const TileSelection: React.FC<TileSelectionProps> = ({
  selected,
  faction = Faction.DEFAULT,
  masterLog = null,
  onBuilt,
}) => {
  const items = useSelectionDisplay(selected);

  return (
    <Box style={{ flex: 1, minWidth: 220, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xs" justify="center" align="center">
          <Title order={4}>Selection</Title>
          <Group justify="left" gap="xs">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <Text key={idx} ml="xs">
                  • {item.label}
                </Text>
              ))
            ) : (
              <Text c="dimmed">No selection</Text>
            )}
          </Group>
          <BuildSelectionButton
            selected={selected}
            faction={faction}
            masterLog={masterLog}
            onBuilt={onBuilt}
          />
        </Stack>
      </Card>
    </Box>
  );
};

export default TileSelection;
