import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useSelectionDisplay } from "../../hooks/useSelectionDisplay.ts";
import type { GameBoardSelection } from "../../types/gameboard.types.tsx";
import {
  ResourceType,
  TraderType,
  type BuildPayload,
  type TradePayload,
  type SettingsData,
  SETTLEMENT,
  ROAD,
} from "shared";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";

const RESOURCE_OPTIONS = [
  ResourceType.WOOD,
  ResourceType.BRICK,
  ResourceType.SHEEP,
  ResourceType.WHEAT,
  ResourceType.ORE,
].map((r) => ({ value: r, label: r }));

/* ------------------------------------------------------------------ *
 * Responsive helper: measure the container width so font sizes and
 * layouts adapt to the available space (same approach as DiceRoller).
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ *
 * Action zone sizing: every mode renders its controls inside a
 * fixed-height footer so buttons and trade fields always appear at
 * the SAME position, whichever mode is active.
 * ------------------------------------------------------------------ */
const ACTION_ZONE_MIN_HEIGHT = 170;

/* ================================================================== *
 * TradeOfferPanel : reusable trade panel
 *  - Same 4-row structure for ALL trade modes (requirement: fields
 *    always at the same place):
 *      row 1 → offer resource  (+ offer amount if free-rate trade)
 *      row 2 → target resource + target amount
 *      row 3 → rate hint
 *      row 4 → send button
 *  - ratio = null            → free trade (players): offer + target fully
 *                              editable by the player.
 *  - ratio = N (bank trade)  → the offer AMOUNT is auto-derived from the
 *                              target amount (target × N).
 *  - offerLockedResource (specialized port) → the offer Select is
 *    pre-filled with the specialized resource and DISABLED (dropdown
 *    blocked), but keeps the exact same slot/size as the other modes'
 *    Select, so switching between trade modes never shifts the layout.
 *  - TARGET side is always freely choosable (resource + amount).
 *  - `isMyTurn = false` → every field is disabled (view-only).
 * ================================================================== */
interface TradeOfferPanelProps {
  ratio: number | null;
  offerLockedResource?: ResourceType;
  sourceId: string;
  sourceKind: TraderType;
  targetOwnerId?: string | null;
  isMyTurn: boolean;
}

const TradeOfferPanel: React.FC<TradeOfferPanelProps> = ({
  ratio,
  offerLockedResource,
  sourceId,
  sourceKind,
  targetOwnerId = null,
  isMyTurn,
}) => {
  // Offer resource — pre-set to the specialized resource when locked
  const [chosenOfferResource, setChosenOfferResource] =
    useState<ResourceType | null>(offerLockedResource ?? null);
  // Target side — always editable (when it's the player's turn)
  const [targetResource, setTargetResource] = useState<ResourceType | null>(
    null,
  );
  const [targetAmount, setTargetAmount] = useState<number>(1);
  // Offer amount — free only for player-to-player trades
  const [freeOfferAmount, setFreeOfferAmount] = useState<number>(1);
  const isBankTrade = ratio !== null;

  const offerResource = offerLockedResource ?? chosenOfferResource;
  const offerAmount = isBankTrade
    ? targetAmount * (ratio as number)
    : freeOfferAmount;

  const isValid =
    offerResource !== null &&
    targetResource !== null &&
    offerAmount > 0 &&
    targetAmount > 0;

  const handleSend = useCallback(() => {
    if (!isValid || !isMyTurn) return;

    const payload: TradePayload = {
      trader: sourceKind,
      sourceId,
      offer: { resource: offerResource!, amount: offerAmount },
      target: { resource: targetResource!, amount: targetAmount },
    };
    socket.emit("trade", { ...payload, targetOwnerId });
    console.log("Trade offer sent:", payload, "→ owner:", targetOwnerId);
  }, [
    isValid,
    isMyTurn,
    sourceKind,
    sourceId,
    offerResource,
    offerAmount,
    targetResource,
    targetAmount,
    targetOwnerId,
  ]);

  return (
    <Stack gap="xs" w="100%">
      {/* Row 1 — offer side (Select in EVERY mode; disabled + pre-filled
          for specialized ports, editable elsewhere: same slot either way) */}
      <Group justify="space-between" gap="xs" grow wrap="wrap">
        <Select
          size="xs"
          placeholder="Offer resource"
          data={RESOURCE_OPTIONS}
          value={offerResource}
          onChange={(v) => setChosenOfferResource(v as ResourceType)}
          disabled={Boolean(offerLockedResource) || !isMyTurn}
          style={{ flex: 1, minWidth: 120 }}
        />
        {!isBankTrade && (
          <NumberInput
            size="xs"
            min={1}
            value={freeOfferAmount}
            onChange={(v) => setFreeOfferAmount(Number(v) || 1)}
            disabled={!isMyTurn}
            style={{ flex: 0, width: 90 }}
          />
        )}
      </Group>

      {/* Row 2 — target side (always freely choosable) */}
      <Group justify="space-between" gap="xs" grow wrap="wrap">
        <Select
          size="xs"
          placeholder="Target resource"
          data={RESOURCE_OPTIONS}
          value={targetResource}
          onChange={(v) => setTargetResource(v as ResourceType)}
          disabled={!isMyTurn}
          style={{ flex: 1, minWidth: 120 }}
        />
        <NumberInput
          size="xs"
          min={1}
          value={targetAmount}
          onChange={(v) => setTargetAmount(Number(v) || 1)}
          disabled={!isMyTurn}
          style={{ flex: 0, width: 90 }}
        />
      </Group>

      {/* Row 3 — rate hint */}
      <Text size="xs" c="dimmed" style={{ minHeight: 16 }}>
        {isBankTrade
          ? `Rate: ${ratio} : 1 — giving ${offerAmount} ${offerResource ?? "?"} for ${targetAmount} ${targetResource ?? "?"}`
          : "Free rate — agreed between players"}
      </Text>

      {/* Row 4 — send button, always last, always bottom-aligned */}
      <Button size="xs" onClick={handleSend} disabled={!isValid || !isMyTurn}>
        Send trade offer
      </Button>
    </Stack>
  );
};

/* ================================================================== *
 * BuildSelectionButton : road / settlement construction
 *  - SINGLE click sends the build request straight to the server
 *    (no modal, no double-click confirmation).
 *  - The busy/request-tracking flow is unchanged: the response is
 *    detected via masterLog, with a safety timeout.
 *  - `isMyTurn = false` disables the button entirely.
 * ================================================================== */
interface PendingBuild {
  target: BuildPayload;
  logAtSend: string | null;
}
const BUILD_TIMEOUT_MS = 500;

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  masterLog: string | null;
  onBuilt?: (target: BuildPayload) => void;
  isMyTurn: boolean;
}

const BuildSelectionButton: React.FC<BuildSelectionButtonProps> = ({
  selected,
  masterLog,
  onBuilt,
  isMyTurn,
}) => {
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<PendingBuild | null>(null);

  const target = useMemo<BuildPayload | null>(() => {
    if (selected.selectedRoad) {
      return {
        kind: ROAD,
        id: selected.selectedRoad.edge.id,
        data: selected.selectedRoad,
      };
    }
    if (selected.selectedSettlement) {
      return {
        kind: SETTLEMENT,
        id: selected.selectedSettlement.vertex.id,
        data: selected.selectedSettlement,
      };
    }
    return null;
  }, [selected.selectedRoad, selected.selectedSettlement]);

  // Single click → emit the build request immediately
  const handleBuildRequest = useCallback(() => {
    if (busy || !target || !isMyTurn) return;
    pendingRef.current = { target, logAtSend: masterLog };
    setBusy(true);
    socket.emit("build", {
      kind: target.kind,
      id: target.id,
      data: target.data,
    });
  }, [busy, target, masterLog, isMyTurn]);

  // Resolve the pending request when the server answers (masterLog moved)
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const serverAnswered = masterLog !== pending.logAtSend;
    if (!serverAnswered) return;

    pendingRef.current = null;
    setBusy(false);
    onBuilt?.(pending.target);
  }, [masterLog, onBuilt]);

  // Safety timeout if the server never answers
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

  const actionLabel =
    target?.kind === SETTLEMENT && target.data.ownerId ? "Upgrade" : "Build";

  return (
    <Button
      w="100%"
      onClick={handleBuildRequest}
      loading={busy}
      disabled={busy || !isMyTurn}
    >
      {busy ? "Building…" : actionLabel}
    </Button>
  );
};

/* ================================================================== *
 * Item list rendering: one line per item, font size adapts to the
 * longest label AND to the actual card width (responsive).
 * ================================================================== */
const ITEMS_FONT_MIN = 14;
const ITEMS_FONT_MAX = 18;
const ITEMS_AVG_CHAR = 5.2;
const ITEMS_FALLBACK_WIDTH = 220;

const computeItemsFontSize = (
  labels: string[],
  availableWidth: number,
): number => {
  const maxLen = labels.reduce((max, l) => Math.max(max, l.length), 0);
  if (maxLen === 0 || availableWidth <= 0) return ITEMS_FONT_MAX;
  const rawSize = availableWidth / (maxLen * ITEMS_AVG_CHAR);
  return Math.max(ITEMS_FONT_MIN, Math.min(ITEMS_FONT_MAX, rawSize));
};

interface SelectionItemsProps {
  items: { label: string }[];
  availableWidth: number;
}

const SelectionItems: React.FC<SelectionItemsProps> = ({
  items,
  availableWidth,
}) => {
  if (items.length === 0) {
    return <Text c="dimmed">No selection</Text>;
  }

  const fontSize = computeItemsFontSize(
    items.map((i) => i.label),
    availableWidth,
  );

  return (
    <Stack gap={2} w="100%" align="flex-start" pl="xs">
      {items.map((item, idx) => (
        <Text
          key={idx}
          style={{
            fontSize,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          • {item.label}
        </Text>
      ))}
    </Stack>
  );
};

/* ================================================================== *
 * SelectionMenu : main component, dispatch by selection kind
 * ================================================================== */
interface SelectionMenuProps {
  isMyTurn: boolean;
  selected: GameBoardSelection;
  settings: SettingsData;
  masterLog?: string | null;
  currentPlayerId?: string | null;
  onBuilt?: (target: BuildPayload) => void;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  selected,
  settings,
  masterLog = null,
  onBuilt,
  isMyTurn,
}) => {
  const items = useSelectionDisplay(selected);
  const { ref: cardBodyRef, width: cardBodyWidth } =
    useElementWidth<HTMLDivElement>();

  const itemsAvailableWidth =
    cardBodyWidth > 0 ? cardBodyWidth - 40 : ITEMS_FALLBACK_WIDTH;

  /* ------------------------------------------------------------ *
   * Modular content depending on the selected kind.
   * Every branch renders INSIDE the same fixed-height action zone,
   * so controls stay at the same position across modes.
   * ------------------------------------------------------------ */
  const renderActionArea = () => {
    const turnFlag = { isMyTurn };

    if (selected.selectedCoast) {
      const { port } = selected.selectedCoast;

      if (!port) {
        return (
          <Text size="sm" c="dimmed">
            Coast — no port available
          </Text>
        );
      }
      if (port && port.type === "generic") {
        return (
          <TradeOfferPanel
            ratio={settings.genericPortOfferRate}
            sourceId={port.id}
            sourceKind={TraderType.GENERIC_PORT}
            {...turnFlag}
          />
        );
      }

      return (
        <TradeOfferPanel
          ratio={settings.specialPortOfferRate}
          offerLockedResource={port.type as ResourceType}
          sourceId={port.id}
          sourceKind={TraderType.SPECIALIZED_PORT}
          {...turnFlag}
        />
      );
    }

    if (selected.selectedTile) return null;

    if (selected.selectedRoad || selected.selectedSettlement) {
      return (
        <BuildSelectionButton
          selected={selected}
          masterLog={masterLog}
          onBuilt={onBuilt}
          {...turnFlag}
        />
      );
    }

    if (selected.selectedReserve) {
      return (
        <TradeOfferPanel
          ratio={settings.reserveOfferRate}
          sourceId={selected.selectedReserve.id}
          sourceKind={TraderType.RESERVE}
          {...turnFlag}
        />
      );
    }

    return (
      <Text size="sm" c="dimmed">
        No selection
      </Text>
    );
  };

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 220,
        width: "100%",
        alignContent: "center",
        cursor: !isMyTurn ? "not-allowed" : "pointer",
      }}
    >
      <Card
        withBorder
        radius="md"
        shadow="sm"
        mih={290}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Stack gap="xs" justify="center" align="center" w="100%">
          <Group justify="space-between" w="100%" wrap="nowrap">
            <Title order={4}>Selection</Title>
            {!isMyTurn && (
              <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                Not your turn
              </Text>
            )}
          </Group>
          <Box ref={cardBodyRef} w="100%">
            <SelectionItems
              items={items}
              availableWidth={itemsAvailableWidth}
            />
          </Box>

          {/* Fixed-height action zone: whichever mode is active, its
              controls (button or trade panel) always start at the same
              y-position, so nothing "jumps" between modes. */}
          <Box
            w="100%"
            style={{
              minHeight: ACTION_ZONE_MIN_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            {renderActionArea()}
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default SelectionMenu;
