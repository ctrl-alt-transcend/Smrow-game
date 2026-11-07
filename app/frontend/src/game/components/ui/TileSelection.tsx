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
import { useSelectionDisplay } from "../../hooks/useSelectionDisplay";
import type { GameBoardSelection } from "../../types/gameboard.types";
import {
  type BuildRequestPayload,
  type TradeRequestPayload
} from "../../../../../shared/game/game.types";
import {
  GENERIC_PORT_RATE,
  RessourceType,
  SPECIAL_PORT_RATE,
  type TraderType
} from "../../../../../shared/game/gameboard.types";
import { socket } from "../../../socket.tsx";


/** Resource options (keep in sync with your RessourceType union) */
const RESSOURCE_OPTIONS = [RessourceType.WOOD, RessourceType.BRICK,
  RessourceType.SHEEP, RessourceType.WHEAT, RessourceType.ORE].map(
  (r) => ({ value: r, label: r }),
);


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
 * ================================================================== */

interface TradeOfferPanelProps {
  ratio: number | null;
  /** resource imposed on the offer side (specialized port only) */
  offerLockedResource?: RessourceType;
  /** identifies the trade in the payload sent to the server */
  sourceId: string;
  sourceKind: TraderType;
  /** recipient player (player-to-player trades only) */
  targetOwnerId?: string | null;
}

const TradeOfferPanel: React.FC<TradeOfferPanelProps> = ({
  ratio,
  offerLockedResource,
  sourceId,
  sourceKind,
  targetOwnerId = null,
}) => {
  // Target side — always editable
  const [targetResource, setTargetResource] = useState<RessourceType | null>(null);
  const [targetAmount, setTargetAmount] = useState<number>(1);

  // Offer resource — free unless locked by a specialized port
  const [offerResource, setOfferResource] = useState<RessourceType | null>(
    offerLockedResource ?? null,
  );
  // Offer amount — free only for player-to-player trades
  const [freeOfferAmount, setFreeOfferAmount] = useState<number>(1);

  const isBankTrade = ratio !== null;
  const isOfferResourceLocked = Boolean(offerLockedResource);

  // Keep the offer resource in sync when the locked resource changes
  useEffect(() => {
    setOfferResource(offerLockedResource ?? null);
  }, [offerLockedResource]);

  // Bank trade: offer amount is always derived from the target amount
  const offerAmount = isBankTrade ? targetAmount * (ratio as number) : freeOfferAmount;

  const isValid =
    offerResource !== null &&
    targetResource !== null &&
    offerAmount > 0 &&
    targetAmount > 0;

  const handleSend = useCallback(() => {
    if (!isValid) return;

    const payload: TradeRequestPayload = {
      trader: sourceKind,
      sourceId,
      offer: { resource: offerResource!, amount: offerAmount },
      target: { resource: targetResource!, amount: targetAmount },
    };

    // Server-side TODO: route according to payload.kind
    //  - "port"  : validate ratio + resource ownership, credit target
    //  - "player": notify targetOwnerId, wait for their acceptance

    socket.emit("trade", { ...payload, targetOwnerId });
    console.log("Trade offer sent:", payload, "→ owner:", targetOwnerId);
  }, [
    isValid,
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
      <Group justify="space-between" gap="xs" grow>
        {isOfferResourceLocked ? (
          <Text size="sm">
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
            onChange={(v) => setOfferResource(v as RessourceType)}
          />
        )}
        {!isBankTrade && (
          <NumberInput
            size="xs"
            min={1}
            value={freeOfferAmount}
            onChange={(v) => setFreeOfferAmount(Number(v) || 1)}
            w={90}
          />
        )}
      </Group>

      {/* Target side — always freely choosable (ports & reserve included) */}
      <Group justify="space-between" gap="xs" grow>
        <Select
          size="xs"
          placeholder="Target resource"
          data={RESSOURCE_OPTIONS}
          value={targetResource}
          onChange={(v) => setTargetResource(v as RessourceType)}
        />
        <NumberInput
          size="xs"
          min={1}
          value={targetAmount}
          onChange={(v) => setTargetAmount(Number(v) || 1)}
          w={90}
        />
      </Group>

      {/* Rate hint */}
      <Text size="xs" c="dimmed">
        {isBankTrade
          ? `Rate: ${ratio} : 1 — giving ${offerAmount} ${offerResource ?? "?"} for ${targetAmount} ${targetResource ?? "?"}`
          : "Free rate — agreed between players"}
      </Text>

      <Button size="xs" onClick={handleSend} disabled={!isValid}>
        Send trade offer
      </Button>
    </Stack>
  );
};

/* ================================================================== *
 * BuildSelectionButton : road / settlement construction (unchanged logic)
 * ================================================================== */

interface PendingBuild {
  target: BuildRequestPayload;
  logAtSend: string | null;
}
const BUILD_TIMEOUT_MS = 500;

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  masterLog: string | null;
  onBuilt?: (target: BuildRequestPayload) => void;
}

const BuildSelectionButton: React.FC<BuildSelectionButtonProps> = ({
  selected,
  masterLog,
  onBuilt,
}) => {
  const [busy, setBusy] = useState(false);
  const [buttonName, setButtonName] = useState("");
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

  /** 1. Save the "build intention" and lock the component */
  const handleConfirm = useCallback(() => {
    if (busy || !target) return;
    pendingRef.current = { target, logAtSend: masterLog };
    setBusy(true);
    socket.emit("build", {
      kind: target.kind,
      id: target.id,
      data: target.data,
    });
  }, [busy, target, masterLog]);

  /** 2. Unlock component when the response arrives */
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const serverAnswered = masterLog !== pending.logAtSend;
    if (!serverAnswered) return;

    pendingRef.current = null;
    setBusy(false);
    onBuilt?.(pending.target);
  }, [masterLog, onBuilt]);

  /** 3. Anti-blocking guard if the server doesn't respond */
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
        onConfirm: handleConfirm,
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
        onConfirm: handleConfirm,
        centered: true,
      });
    }
  };


  return (
    <Button onClick={openModal} loading={busy} disabled={busy}>
      Build
    </Button>
  );
};

/* ================================================================== *
 * Item list rendering: one line per item, font size adapts to the
 * longest label so every entry fits on a single line.
 *
 * TUNING KNOBS:
 *  - ITEMS_FONT_MIN  : minimum size (too low → unreadable, raise this first)
 *  - ITEMS_FONT_MAX  : maximum size for short labels
 *  - ITEMS_AVG_CHAR  : approximates the character width (px) used by Mantine's
 *                      default font at 1em — lowering it allows longer lines
 *                      before shrinking.
 * Very long labels beyond the minimum size are truncated with an ellipsis
 * instead of overflowing.
 * ================================================================== */

const ITEMS_FONT_MIN = 18;
const ITEMS_FONT_MAX = 18;
const ITEMS_AVG_CHAR = 5.2; // px per char at fontSize 1em (default sans-serif)
const ITEMS_MAX_WIDTH = 220; // available width in the card, in px

const computeItemsFontSize = (labels: string[]): number => {
  const maxLen = labels.reduce((max, l) => Math.max(max, l.length), 0);
  const rawSize = ITEMS_MAX_WIDTH / (maxLen * ITEMS_AVG_CHAR);
  return Math.max(ITEMS_FONT_MIN, Math.min(ITEMS_FONT_MAX, rawSize));
};

interface SelectionItemsProps {
  items: { label: string }[];
}

const SelectionItems: React.FC<SelectionItemsProps> = ({ items }) => {
  if (items.length === 0) {
    return <Text c="dimmed">No selection</Text>;
  }

  const fontSize = computeItemsFontSize(items.map((i) => i.label));

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
 * TileSelection : main component, dispatch by selection kind
 * ================================================================== */

interface TileSelectionProps {
  selected: GameBoardSelection;
  masterLog?: string | null;
  onBuilt?: (target: BuildRequestPayload) => void;
  /** id of the current player — TODO wire to your session/auth */
  currentPlayerId?: string | null;
}

export const TileSelection: React.FC<TileSelectionProps> = ({
  selected,
  masterLog = null,
  onBuilt,
  //currentPlayerId = null,
}) => {
  const items = useSelectionDisplay(selected);

  /* ------------------------------------------------------------ *
   * Modular content depending on the selected kind
   * ------------------------------------------------------------ */
  const renderActionArea = () => {
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
          />
        );
      }
      // Specialized port: 2 (locked resource) : 1 target
      return (
        <TradeOfferPanel
          ratio={SPECIAL_PORT_RATE}
          offerLockedResource={port.type as RessourceType}
          sourceId={port.coastId}
          sourceKind="specialized port"
        />
      );
    }

    // 2. TILE: information only, no construction action
    if (selected.selectedTile) {
      return null;
    }

    // 3. ROAD: current behavior
    if (selected.selectedRoad) {
      return (
        <BuildSelectionButton
          selected={selected}
          masterLog={masterLog}
          onBuilt={onBuilt}
        />
      );
    }

    // 4. SETTLEMENT: current behavior + player-to-player trade
    if (selected.selectedSettlement) {
      //const { ownerId } = selected.selectedSettlement;

      // TODO: if ownerId matches the current player → keep the build button
      // (upgrade settlement/city). For now: foreign owner → free trade.
      //if (ownerId && ownerId !== currentPlayerId) {
      //  return (
      //    <Stack gap="xs" w="100%">
      //      <Text size="xs" c="dimmed">
      //        Trade with player <b>{ownerId}</b> (free rate)
      //      </Text>
      //      <TradeOfferPanel
      //        ratio={null}
      //        sourceId={selected.selectedSettlement.id}
      //        sourceKind="player"
      //        targetOwnerId={ownerId}
      //      />
      //    </Stack>
      //  );
      //}

      return (
        <BuildSelectionButton
          selected={selected}
          masterLog={masterLog}
          onBuilt={onBuilt}
        />
      );
    }

    // 5. RESERVE: player-to-player trade (enable when selectedReserve exists)
    // if (selected.selectedReserve) {
    //   return (
    //     <TradeOfferPanel
    //       ratio={RESERVE_RATE}
    //       sourceId={selected.selectedReserve.id}
    //       sourceKind="player"
    //       targetOwnerId={selected.selectedReserve.ownerId ?? null}
    //     />
    //   );
    // }

    return (
      <Text size="sm" c="dimmed">
        No selection
      </Text>
    );
  };

  return (
    <Box style={{ flex: 1, minWidth: 220, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={290}>
        <Stack gap="xs" justify="center" align="center">
          <Title order={4}>Selection</Title>
          <SelectionItems items={items} />
          {renderActionArea()}
        </Stack>
      </Card>
    </Box>
  );
};

export default TileSelection;
