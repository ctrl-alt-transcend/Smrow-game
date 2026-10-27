// src/utils/harvest.ts
import {
  type TileData,
  type SettlementData,
  type GameBoard,
  Faction,
  LandType
} from '@shared/game/gameboard.types';
import {
  type ResourceKind,
  type PlayerHand,
  type SettlementInfo,
  type TileInfo,
  type HarvestResult,
  type HarvestOptions,
  type HarvestReport,
  LAND_TO_RESOURCE
} from 'src/game/calculation/ressourceCheck.types';
import { axialToPixel } from './hexCalculation';

/**
 * Identifie les trois identifiants canoniques équivalents pour un sommet physique.
 * Un coin "c" d'une tuile "(q,r)" est aussi le coin "(c+2)%6" d'un voisin
 * et le coin "(c+4)%6" d'un deuxième voisin.
 */
function resolveVertexAliases(q: number, r: number, cornerIndex: number): string[] {
  return [
    `${q}:${r}:${cornerIndex}`,                                    // forme originale
    `${q}:${r}:${(cornerIndex + 2) % 6}`,                          // alias 1 (si tu as stocké l'autre sens)
    `${q}:${r}:${(cornerIndex + 4) % 6}`                          // alias 2
  ];
}

/**
 * Construit un index inverse: map chaque tuile (q,r) vers ses bâtiments.
 * Complexité O(settlements), à appeler une fois après setup du plateau.
 */
export function buildTileIndex(
  layout: TileData[],
  settlements: SettlementData[]
): Map<string, TileInfo> {
  const tileMap = new Map<string, TileInfo>();

  // Initialiser toutes les tuiles
  for (const tile of layout) {
    const key = `${tile.q}:${tile.r}`;
    tileMap.set(key, {
      q: tile.q,
      r: tile.r,
      land: tile.land ?? null,
      value: tile.value ?? null,
      hasRobber: false, // à mettre à jour via updateRobberPosition()
      settlements: []
    });
  }

  // Associer chaque bâtiment à sa tuile
  for (const settlement of settlements) {
    const { vertex } = settlement;
    // Décode l'id du sommet "{q}:{r}:{cornerIndex}"
    const parts = vertex.id.split(':');
    if (parts.length !== 3) continue;

    const [sq, sr, sc] = parts;
    const q = parseInt(sq, 10);
    const r = parseInt(sr, 10);
    const cornerIndex = parseInt(sc, 10);

    if (isNaN(q) || isNaN(r) || isNaN(cornerIndex)) continue;

    const tileKey = `${q}:${r}`;
    const tile = tileMap.get(tileKey);
    if (!tile) continue;

    // Normalise les aliases et vérifie correspondance géométrique
    const aliases = resolveVertexAliases(q, r, cornerIndex);
    const normalizedId = aliases.find(a => a === vertex.id) ?? vertex.id;

    tile.settlements.push({
      id: settlement.id,
      vertexQ: q,
      vertexR: r,
      vertexCorner: cornerIndex,
      faction: settlement.faction,
      isCity: (settlement as any).isCity ?? false // adapte selon ton type SettlementData
    });
  }

  return tileMap;
}

/**
 * Place ou déplace le brigand sur une tuile spécifique.
 */
export function updateRobberPosition(
  tileIndex: Map<string, TileInfo>,
  q: number | null,
  r: number | null
): void {
  // Réinitialise toutes les tuiles
  for (const tile of tileIndex.values()) {
    tile.hasRobber = false;
  }
  // Pose le brigand
  if (q != null && r != null) {
    const key = `${q}:${r}`;
    const tile = tileIndex.get(key);
    if (tile) tile.hasRobber = true;
  }
}

/**
 * Calcule le rendement d'un bâtiment (1 pour colonie, 2 pour ville).
 */
function yieldOfSettlement(settlement: SettlementInfo, customYield?: (s: SettlementInfo) => 1 | 2): 1 | 2 {
  if (customYield) return customYield(settlement);
  return settlement.isCity ? 2 : 1;
}

/**
 * Détermine quelles ressources ont été demandées ce tour.
 * Retourne { resource -> totalRequested }.
 */
function computeResourceDemand(
  tileIndex: Map<string, TileInfo>,
  diceTotal: number
): Partial<Record<ResourceKind, number>> {
  const demand: Partial<Record<ResourceKind, number>> = {};

  for (const tile of tileIndex.values()) {
    // Désert = aucune production
    if (tile.land === LandType.DESERT || tile.land == null) continue;
    // Valeur invalide = aucune production
    if (tile.value == null) continue;
    // Brigand bloqué
    if (tile.hasRobber) continue;
    // Pas le bon chiffre
    if (tile.value !== diceTotal) continue;

    const resource = LAND_TO_RESOURCE[tile.land as keyof typeof LAND_TO_RESOURCE];
    if (!resource) continue;

    const totalNeeded = tile.settlements.reduce((sum, s) => {
      return sum + yieldOfSettlement(s);
    }, 0);

    if (totalNeeded > 0) {
      demand[resource] = (demand[resource] ?? 0) + totalNeeded;
    }
  }

  return demand;
}

/**
 * Vérifie si la banque peut satisfaire TOUTES les demandes (règle officielle).
 * Retourne { canSatisfy: true } ou { canSatisfy: false, shortageResource: ResourceKind }.
 */
function checkBankShortage(
  bankResources: Record<ResourceKind, number> | undefined,
  demand: Partial<Record<ResourceKind, number>>
): { canSatisfy: boolean; shortageResource?: ResourceKind } {
  if (!bankResources) return { canSatisfy: true };

  for (const [key, requested] of Object.entries(demand)) {
    const res = key as ResourceKind;
    if ((bankResources[res] ?? 0) < requested) {
      return { canSatisfy: false, shortageResource: res };
    }
  }

  return { canSatisfy: true };
}

/**
 * Extrait les cartes de la banque pour chaque joueur.
 */
function distributeResources(
  tileIndex: Map<string, TileInfo>,
  diceTotal: number,
  options: HarvestOptions
): HarvestResult[] {
  const results: HarvestResult[] = [];
  const seenFactions = new Set<Faction>();

  // Passe 1 : identifier les factions qui vont récolter
  const harvestingFactions = new Set<Faction>();
  for (const tile of tileIndex.values()) {
    if (tile.land === LandType.DESERT || tile.land == null) continue;
    if (tile.value == null) continue;
    if (tile.hasRobber) continue;
    if (tile.value !== diceTotal) continue;

    for (const s of tile.settlements) {
      harvestingFactions.add(s.faction);
    }
  }

  // Passe 2 : calculer demande totale
  const demand = computeResourceDemand(tileIndex, diceTotal);

  // Passe 3 : vérifier pénurie bancaire
  let shortageTriggered = false;
  if (options.applyBankShortage) {
    const check = checkBankShortage(options.bank?.resources, demand);
    if (!check.canSatisfy) {
      shortageTriggered = true;
      // Personne ne reçoit rien
      for (const faction of harvestingFactions) {
        if (!seenFactions.has(faction)) {
          seenFactions.add(faction);
          results.push({
            faction,
            received: {},
            reason: `Pénurie bancaire sur ${check.shortageResource}`
          });
        }
      }
      return results;
    }
  }

  // Passe 4 : distribuer les ressources
  for (const tile of tileIndex.values()) {
    if (tile.land === LandType.DESERT || tile.land == null) continue;
    if (tile.value == null) continue;
    if (tile.hasRobber) continue;
    if (tile.value !== diceTotal) continue;

    const resource = LAND_TO_RESOURCE[tile.land as keyof typeof LAND_TO_RESOURCE];
    if (!resource) continue;

    // Regroupe par faction
    const factionSets = new Map<Faction, number>();
    for (const s of tile.settlements) {
      const current = factionSets.get(s.faction) ?? 0;
      factionSets.set(s.faction, current + yieldOfSettlement(s));
    }

    for (const [faction, qty] of factionSets.entries()) {
      if (!seenFactions.has(faction)) {
        seenFactions.add(faction);
        results.push({
          faction,
          received: { [resource]: qty }
        });
      } else {
        const existing = results.find(r => r.faction === faction)!;
        existing.received[resource] = (existing.received[resource] ?? 0) + qty;
      }
    }
  }

  // Ajoute les factions sans récolte (pour tracking)
  for (const faction of harvestingFactions) {
    if (!seenFactions.has(faction)) {
      seenFactions.add(faction);
      results.push({ faction, received: {} });
    }
  }

  return results;
}

/**
 * Point d'entrée principal. Calcule qui reçoit quoi après un lancé de dés.
 */
export function calculateHarvest(
  boardData: GameBoard,
  diceRoll: number,
  options: HarvestOptions = {}
): HarvestReport {
  const { layout, settlements } = boardData;

  // Construis l'index
  const tileIndex = buildTileIndex(layout, settlements);

  // Gère cas spécial 7
  if (diceRoll === 7) {
    return {
      diceRoll: 7,
      tilesProduced: 0,
      harvests: [],
      shortageTriggered: false
    };
  }

  const harvests = distributeResources(tileIndex, diceRoll, options);

  // Compte tuiles productrices
  const tilesProduced = [...tileIndex.values()].filter(tile => {
    if (tile.land === LandType.DESERT || tile.land == null) return false;
    if (tile.value == null) return false;
    if (tile.hasRobber) return false;
    return tile.value === diceRoll;
  }).length;

  return {
    diceRoll,
    tilesProduced,
    harvests,
    shortageTriggered: harvests.some(h => h.reason?.includes('Pénurie'))
  };
}

/**
 * Debug utility : vérifie que ton index est cohérent avec la géométrie réelle.
 */
export function verifyVertexMapping(
  layout: TileData[],
  settlements: SettlementData[]
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const epsilon = 0.5;

  for (const settlement of settlements) {
    const { vertex } = settlement;
    const parts = vertex.id.split(':');
    if (parts.length !== 3) {
      errors.push(`Sommet "${vertex.id}" n'a pas 3 parties découpées par ":"`);
      continue;
    }

    const [sq, sr, sc] = parts;
    const q = parseInt(sq, 10);
    const r = parseInt(sr, 10);
    const cornerIndex = parseInt(sc, 10);

    if (isNaN(q) || isNaN(r) || isNaN(cornerIndex)) {
      errors.push(`Sommet "${vertex.id}" contient des valeurs non-numériques`);
      continue;
    }

    // Calcul position attendue
    const expected = axialToPixel(q, r, 1); // HEX_SIZE = 1 pour comparaisons relatives
    const dx = Math.abs(expected.x - vertex.x);
    const dy = Math.abs(expected.y - vertex.y);

    if (dx > epsilon || dy > epsilon) {
      errors.push(
        `Décalage géométrique sur "${vertex.id}": ` +
        `attendu (${expected.x.toFixed(2)}, ${expected.y.toFixed(2)}) vs ` +
        `donné (${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`
      );
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}