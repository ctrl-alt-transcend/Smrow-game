import {
  Vertex,
  Edge,
  TileData,
  RoadData,
  SettlementData,
  GameBoardData
} from '../types/gameboard.types';
import { getHexCorners, getHexEdges, HEX_SIZE } from './hexCalculation';

/**
 * Fonction pure — zéro dépendance React
 * Input: liste de tuiles
 * Output: toutes les entités géométriques pré-calculées
 *
 * Avantages:
 * - Testable sans React
 * - Applicable dans Node.js, workers, tests unitaires
 * - Pas de recalculs accidentels
 */
export const calculateGameBoardData = (tiles: TileData[]): GameBoardData => {
  // --- 1. Générer tous les sommets uniques (pour les settlements) ---
  const allVertices = new Map<string, Vertex>();
  tiles.forEach(tile => {
    getHexCorners(tile.q, tile.r, HEX_SIZE).forEach(v => {
      allVertices.set(v.id, v);
    });
  });

  // Filtrer les sommets valides pour Catan (ceux partagés par au moins 1 tuile)
  const settlements: SettlementData[] = Array.from(allVertices.values())
    .map(v => ({ id: v.id, vertex: v }))
    .filter(s => {
      // Tu peux ajouter tes propres règles ici (ex: périphérie uniquement)
      return true;
    });

  // --- 2. Générer toutes les arêtes uniques (pour les routes) ---
  const allEdges = new Map<string, Edge>();
  tiles.forEach(tile => {
    getHexEdges(tile.q, tile.r, HEX_SIZE).forEach(e => {
      allEdges.set(e.id, e);
    });
  });

  const roads: RoadData[] = Array.from(allEdges.values()).map(e => ({
    id: e.id,
    edge: e
  }));

  // --- 3. Calculer les dimensions SVG nécessaires ---
  const margin = 100;
  const bounds = Array.from(allVertices.values()).reduce((acc, v) => ({
    minX: Math.min(acc.minX, v.x),
    maxX: Math.max(acc.maxX, v.x),
    minY: Math.min(acc.minY, v.y),
    maxY: Math.max(acc.maxY, v.y)
  }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

  const svgWidth = (bounds.maxX - bounds.minX) + margin * 2;
  const svgHeight = (bounds.maxY - bounds.minY) + margin * 2;
  const offsetX = bounds.minX - margin;
  const offsetY = bounds.minY - margin;

  return {
    vertices: Array.from(allVertices.values()),
    edges: Array.from(allEdges.values()),
    settlements,
    roads,
    svgBounds: { svgWidth, svgHeight, offsetX, offsetY }
  };
};