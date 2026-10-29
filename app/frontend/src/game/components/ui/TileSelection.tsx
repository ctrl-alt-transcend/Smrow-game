/* ==========================================================================
 * components/ui/TileSelection.tsx
 *
 * Refactor : plus aucun `useGameBoard`.
 *
 * Principe (calqué sur DiceRoller) :
 *   - TileSelection ne fait QUE émettre l'intention vers le backend ;
 *   - il ne touche ni aux factions, ni au masterLog : le serveur reste la
 *     seule source de vérité, et c'est GameBoard / GameMasterLog qui se
 *     rafraîchissent quand useGameState reçoit le nouvel état ;
 *   - il se contente d'observer l'arrivée d'un nouvel événement serveur
 *     (la prop `masterLog`, comme dans DiceRoller) pour se déverrouiller,
 *     exactement là où DiceRoller appelle handleAnimationComplete.
 *
 * Ce qui a disparu par rapport à la version précédente :
 *   - import { useGameBoard } from "../../contexts/GameBoardContext"
 *   - updateRoadFaction / updateSettlementFaction / updateMasterLog
 *   - le `let log: string | null = ""` jamais renseigné + `updateMasterLog(log ?? '...')`
 *   - le hook useBuildSelection (plus nécessaire : pas de promesse à tenir,
 *     puisque l'état local n'est plus mis à jour ici)
 * ========================================================================== */

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
import { Faction, /*type RoadData, type SettlementData*/ } from "../../../../../shared/game/gameboard.types.ts";
import type { BuildRequestPayload } from "@shared/game/game.types.ts";
import { socket } from "../../../socket.tsx";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Ce qu'on attend en retour : pendant de `pendingResultRef` dans DiceRoller. */
interface PendingBuild {
  target: BuildRequestPayload;
  /** masterLog connu au moment de l'émission : sert à détecter l'événement suivant. */
  logAtSend: string | null;
}

/** Garde-fou : si le serveur refuse silencieusement, on ne reste pas bloqué. */
const BUILD_TIMEOUT_MS = 8000;

/* -------------------------------------------------------------------------- */
/* Bouton de construction                                                     */
/* -------------------------------------------------------------------------- */

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  faction: Faction;
  /**
   * Dernier message poussé par le serveur (≈ `masterLog` dans DiceRoller).
   * C'est la prop dont le changement signale « un nouvel événement est arrivé ».
   */
  masterLog: string | null;
  /** Appelé une fois le serveur confirmé — au parent de nettoyer la sélection. */
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
      return { kind: "road", id: selected.selectedRoad.edge.id,
        data: selected.selectedRoad };
    }
    if (selected.selectedSettlement) {
      return { kind: "settlement", id: selected.selectedSettlement.vertex.id,
        data: selected.selectedSettlement };
    }
    return null;
  }, [selected.selectedRoad, selected.selectedSettlement]);

  /* ------------------------------------------------------------------------ */
  /* 1. Émission vers le backend (≈ handleRollRequest de DiceRoller)           */
  /*    Aucune mutation locale : on mémorise juste l'intention en vol.         */
  /* ------------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------------ */
  /* 2. Déverrouillage à l'arrivée du nouvel événement serveur                 */
  /*    (≈ handleAnimationComplete de DiceRoller)                              */
  /*    On n'applique RIEN : GameBoard et GameMasterLog se sont déjà mis à     */
  /*    jour via useGameState. On libère juste le bouton.                      */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const serverAnswered = masterLog !== pending.logAtSend;
    if (!serverAnswered) return;

    pendingRef.current = null;
    setBusy(false);
    onBuilt?.(pending.target);
  }, [masterLog, onBuilt]);

  /* ------------------------------------------------------------------------ */
  /* 3. Garde-fou anti-blocage                                                */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!busy) return;

    const timer = window.setTimeout(() => {
      if (!pendingRef.current) return;
      pendingRef.current = null;
      setBusy(false);
      console.warn("Build: aucun événement serveur reçu dans le délai imparti");
    }, BUILD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [busy]);

  /* ------------------------------------------------------------------------ */
  /* Modale de confirmation                                                   */
  /* ------------------------------------------------------------------------ */
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

/* -------------------------------------------------------------------------- */
/* Conteneur                                                                  */
/* -------------------------------------------------------------------------- */

interface TileSelectionProps {
  selected: GameBoardSelection;
  /** Faction active, injectée par le parent (avant : Faction.DEFAULT figé). */
  faction?: Faction;
  /** Prop poussée par le serveur — même contrat que DiceRoller. */
  masterLog?: string | null;
  /** Permet au parent (useGameBoardFactory) de vider la sélection après coup. */
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


/* ==========================================================================
 * Côté Game : les deux props à brancher
 * ==========================================================================
 *
 *   <TileSelection
 *     selected={GameBoardProps.selected}
 *     faction={game.activeFaction}          // si dispo dans useGameState
 *     masterLog={game.masterLog}            // ← indispensable : c'est le signal
 *     onBuilt={GameBoardProps.clearSelection} // si ton factory en expose un
 *   />
 *
 * Sans `masterLog`, le bouton reste en `loading` jusqu'au timeout de secours.
 * Si ton state expose un compteur monotone (version, lastEventId, moveCount),
 * préfère-le : contrairement à un texte de log, il change à CHAQUE événement,
 * y compris ceux qui ne produisent pas de message.
 * ========================================================================== */
