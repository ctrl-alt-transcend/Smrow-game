import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
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
import { modals } from "@mantine/modals";
import { useSelectionDisplay } from "../../hooks/useSelectionDisplay.ts";
import type { GameBoardSelection } from "../../types/gameboard.types.tsx";
import {
  GENERIC_PORT_RATE,
  SPECIAL_PORT_RATE,
  RESERVE_RATE,
  ResourceType,
  type BuildPayload,
  type TradePayload,
  type TraderType,
} from "shared";
import { gameSocket as socket } from "../../../sockets/gameSocket.tsx";

const RESSOURCE_OPTIONS = [
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

/* ================================================================== *
 * TradeOfferPanel : reusable trade panel
 *  - ratio = null            → free trade (players): offer + target fully
 *                              editable by the player.
 *  - ratio = N (bank trade)  → the offer AMOUNT is auto-derived from the
 *                              target amount (target × N), but the OFFER
 *                              RESOURCE stays freely choosable unless
 *                              offerLockedResource is set (specialized port).
 *  - TARGET side is always freely choosable (resource + amount), whatever
 *    the kind of trade (ports and reserve included).
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
  // Target side — always editable (when it's the player's turn)
  const [targetResource, setTargetResource] = useState<ResourceType | null>(
    null,
  );
  const [targetAmount, setTargetAmount] = useState<number>(1);
  // Offer amount — free only for player-to-player trades
  const [freeOfferAmount, setFreeOfferAmount] = useState<number>(1);
  const isBankTrade = ratio !== null;
  const isOfferResourceLocked = Boolean(offerLockedResource);
  const [chosenOfferResource, setChosenOfferResource] =
    useState<ResourceType | null>(null);
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
      {/* Offer side */}
      <Group justify="space-between" gap="xs" grow wrap="wrap">
        {isOfferResourceLocked ? (
          <Text size="sm" flex={1} miw={120}>
            Offer: <b>{offerLockedResource}</b> × {offerAmount}{" "}
            <Text component="span" c="dimmed" size="xs">
              (locked by port)
            </Text>
          </Text>
        ) : (
          <Select
            size="xs"
            placeholder="Offer resource"
            data={RESSOURCE_OPTIONS}
            value={offerResource}
            onChange={(v) => setChosenOfferResource(v as ResourceType)}
            disabled={!isMyTurn}
            style={{
              flex: 1,
              minWidth: 120,
            }}
          />
        )}
        {!isBankTrade && (
          <NumberInput
            size="xs"
            min={1}
            value={freeOfferAmount}
            onChange={(v) => setFreeOfferAmount(Number(v) || 1)}
            disabled={!isMyTurn}
            style={{
              flex: 0,
              width: 90,
            }}
          />
        )}
      </Group>

      {/* Target side — always freely choosable (ports & reserve included) */}
      <Group justify="space-between" gap="xs" grow wrap="wrap">
        <Select
          size="xs"
          placeholder="Target resource"
          data={RESSOURCE_OPTIONS}
          value={targetResource}
          onChange={(v) => setTargetResource(v as ResourceType)}
          disabled={!isMyTurn}
          style={{
            flex: 1,
            minWidth: 120,
          }}
        />
        <NumberInput
          size="xs"
          min={1}
          value={targetAmount}
          onChange={(v) => setTargetAmount(Number(v) || 1)}
          disabled={!isMyTurn}
          style={{
            flex: 0,
            width: 90,
          }}
        />
      </Group>

      {/* Rate hint */}
      <Text size="xs" c="dimmed">
        {isBankTrade
          ? `Rate: ${ratio} : 1 — giving ${offerAmount} ${offerResource ?? "?"} for ${targetAmount} ${targetResource ?? "?"}`
          : "Free rate — agreed between players"}
      </Text>

      <Button size="xs" onClick={handleSend} disabled={!isValid || !isMyTurn}>
        Send trade offer
      </Button>
    </Stack>
  );
};

/* ================================================================== *
 * BuildSelectionButton : road / settlement construction (unchanged
 * core logic; `isMyTurn = false` disables the button entirely)
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
  const [buttonName, setButtonName] = useState("");
  const pendingRef = useRef<PendingBuild | null>(null);

  const target = useMemo<BuildPayload | null>(() => {
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

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const serverAnswered = masterLog !== pending.logAtSend;
    if (!serverAnswered) return;

    pendingRef.current = null;
    setBusy(false);
    onBuilt?.(pending.target);
  }, [masterLog, onBuilt]);

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
    if (!isMyTurn) return;

    if (!target) {
      modals.openConfirmModal({
        title: "Pick a valid construction location",
        labels: { confirm: "OK", cancel: "Cancel" },
        centered: true,
      });
      return;
    }
    if (target.kind === "settlement" && target.data.ownerId) {
      setButtonName("Upgrade");
      modals.openConfirmModal({
        title: "Confirm upgrade",
        children: (
          <Text size="sm">
            Are you sure you want to upgrade:{" "}
            <Anchor
              href="#"
              onClick={(event) => {
                event.preventDefault();
                console.log(`Upgrade ${target.kind} to city at:`, target.id);
              }}
            >
              Settlement ({target.id})
            </Anchor>{" "}
            to a City?
          </Text>
        ),
        labels: { confirm: "Confirm", cancel: "Cancel" },
        onConfirm: handleBuildRequest,
        centered: true,
      });
    } else {
      setButtonName("Build");
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
        onConfirm: handleBuildRequest,
        centered: true,
      });
    }
  };

  return (
    <Button onClick={openModal} loading={busy} disabled={busy || !isMyTurn}>
      {buttonName || (isMyTurn ? "Build" : "Not your turn")}
    </Button>
  );
};

/* ================================================================== *
 * Item list rendering: one line per item, font size adapts to the
 * longest label AND to the actual card width (responsive).
 *
 * The available width is measured from the container (ResizeObserver),
 * so ITEMS_MAX_WIDTH below is only a fallback before the first measure.
 * Very long labels beyond the minimum size are truncated with an
 * ellipsis instead of overflowing.
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
  selected: GameBoardSelection;
  masterLog?: string | null;
  onBuilt?: (target: BuildPayload) => void;
  currentPlayerId?: string | null;
  isMyTurn: boolean;
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  selected,
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
   * Modular content depending on the selected kind
   * ------------------------------------------------------------ */
  const renderActionArea = () => {
    const turnFlag = { isMyTurn };

    // 1. COAST: bank trade through a port
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
        // Generic port: 3 offer : 1 target — offer resource freely chosen
        return (
          <TradeOfferPanel
            ratio={GENERIC_PORT_RATE}
            sourceId={port.coastId}
            sourceKind="generic port"
            {...turnFlag}
          />
        );
      }
      // Specialized port: 2 (locked resource) : 1 target
      return (
        <TradeOfferPanel
          ratio={SPECIAL_PORT_RATE}
          offerLockedResource={port.type as ResourceType}
          sourceId={port.coastId}
          sourceKind="specialized port"
          {...turnFlag}
        />
      );
    }

    // 2. TILE: information only, no construction action
    if (selected.selectedTile) {
      return null;
    }

    // 3. ROAD: informations display and build options
    if (selected.selectedRoad) {
      return (
        <BuildSelectionButton
          selected={selected}
          masterLog={masterLog}
          onBuilt={onBuilt}
          {...turnFlag}
        />
      );
    }

    // 4. SETTLEMENT: informations display and build options
    if (selected.selectedSettlement) {
      return (
        <BuildSelectionButton
          selected={selected}
          masterLog={masterLog}
          onBuilt={onBuilt}
          {...turnFlag}
        />
      );
    }

    // 5. RESERVE: 4 offer : 1 target — offer resource freely chosen
    if (selected.selectedReserve) {
      return (
        <TradeOfferPanel
          ratio={RESERVE_RATE}
          sourceId={selected.selectedReserve.id}
          sourceKind="reserve"
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
        style={{
          display: "flex",
          flexDirection: "column",
        }}
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
          {renderActionArea()}
        </Stack>
      </Card>
    </Box>
  );
};

export default SelectionMenu;
