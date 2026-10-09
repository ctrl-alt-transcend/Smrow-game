import {
  Vertex,
  Edge,
  TileData,
  RoadData,
  SettlementData,
  GameBoardData,
  Faction
} from '../types/gameboard.types';
import { getHexCorners, getHexEdges, HEX_SIZE } from './hexCalculation';

/** @description calculate and render an SVG board game based on the given layout */
export const calculateGameBoardData = (tiles: TileData[]): GameBoardData => {
  const allVertices = new Map<string, Vertex>();
  tiles.forEach(tile => {
    getHexCorners(tile.q, tile.r, HEX_SIZE).forEach(v => {
      allVertices.set(v.id, v);
    });
  });

  const settlements: SettlementData[] = Array.from(allVertices.values())
    .map(v => ({ id: v.id, vertex: v, faction: null }))
    .filter(s => {
      return true;
    });

  const allEdges = new Map<string, Edge>();
  tiles.forEach(tile => {
    getHexEdges(tile.q, tile.r, HEX_SIZE).forEach(e => {
      allEdges.set(e.id, e);
    });
  });

  const roads: RoadData[] = Array.from(allEdges.values()).map(e => ({
    id: e.id,
    edge: e,
    faction: null
  }));

  // SVG calculation
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