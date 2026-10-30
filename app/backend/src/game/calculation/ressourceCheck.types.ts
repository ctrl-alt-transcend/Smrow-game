// src/types/harvest.types.ts
import { LandType, Faction } from '@shared/game/gameboard.types'; // ajuste l'import si nécessaire

/** Représente une carte de ressource */
export type ResourceKind =
  'wood' | 'brick' | 'sheep' | 'wheat' | 'ore' | 'desert';

/** Mapping des terrains vers les ressources produites */
export const LAND_TO_RESOURCE: Record<
  Exclude<LandType, 'desert' | 'default'>,
  ResourceKind
> = {
  [LandType.FOREST]: 'wood',
  [LandType.PASTURE]: 'sheep',
  [LandType.HILL]: 'brick',
  [LandType.MOUNTAIN]: 'ore',
  [LandType.FIELD]: 'wheat',
};

/** Représente une main de joueur (ressources possédées) */
export interface PlayerHand {
  faction: Faction;
  resources: Partial<Record<ResourceKind, number>>;
}

/** Représente un bâtiment posé sur un sommet */
export interface SettlementInfo {
  id: string;
  vertexQ: number; // q du sommet (pour debug/mapping)
  vertexR: number; // r du sommet
  vertexCorner: number; // index du coin (0–5)
  faction: Faction;
  isCity: boolean; // true = ville (double rendement), false = colonie
}

/** Représente une tuile avec son statut brigand */
export interface TileInfo {
  q: number;
  r: number;
  land: LandType | null;
  value: number | null; // null = désert
  hasRobber: boolean; // vrai si brigand présent
  settlements: SettlementInfo[]; // bâtiments dessus
}

/** Résultat d'un tour de récolte pour un joueur */
export interface HarvestResult {
  faction: Faction;
  received: Partial<Record<ResourceKind, number>>;
  reason?: string; // message explicatif si pas de récolte (ex: brigand, 7)
}

/** Options de configuration pour la récolte */
export interface HarvestOptions {
  /** Si true, applique la pénurie bancaire (officiel Catan) */
  applyBankShortage?: boolean;
  /** Liste complète des mains des joueurs */
  bank?: {
    resources: Record<ResourceKind, number>;
  };
  /** Fonction personnalisée pour déterminer le yield d'un bâtiment */
  yieldOf?: (settlement: SettlementInfo) => 1 | 2;
}

/** Réponse complète après calcul de récolte */
export interface HarvestReport {
  diceRoll: number;
  tilesProduced: number;
  harvests: HarvestResult[];
  shortageTriggered?: boolean;
}
