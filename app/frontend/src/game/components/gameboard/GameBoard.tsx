import { useState } from 'react';
import { HexTile } from './HexTile'
import { Road } from './RoadTile'
import { Settlement } from './SettlementTile'

import {
    Edge,
    Vertex,
    TileData,
    RoadData,
    SettlementData,
    tilesLayout,
    HoverEntity } from '../../types/gameboard.types';

import {
    getHexCorners,
    getHexEdges,
    HEX_SIZE } from '../../utils/hexRendering'


interface GameBoardState {
  selectedTile: TileData | null;
  selectedSettlement: SettlementData | null;
  selectedRoad: RoadData | null;
}

function GameBoard() {
  const [hovered, setHovered] = useState<HoverEntity>(null);

  const handleTileHover = (isHovered: boolean, tile: TileData) => {
    setHovered(isHovered ? { type: 'tile', q: tile.q, r: tile.r } : null);
  };
  const handleRoadHover = (isHovered: boolean, road: RoadData) => {
    setHovered(isHovered ? { type: 'road', id: road.id } : null);
  };
  const handleSettlementHover = (isHovered: boolean, settlement: SettlementData) => {
    setHovered(isHovered ? { type: 'settlement', id: settlement.id } : null);
  };

  // Helper pour vérifier
  const isTileHovered = (hovered: HoverEntity, tile: TileData) =>
    hovered?.type === 'tile' && hovered.q === tile.q && hovered.r === tile.r;
  const isRoadHovered = (hovered: HoverEntity, road: RoadData) =>
    hovered?.type === 'road' && hovered.id === road.id;
  const isSettlementHovered = (hovered: HoverEntity, settlement: SettlementData) =>
    hovered?.type === 'settlement' && hovered.id === settlement.id;

  const [selected, setSelected] = useState<GameBoardState>({
    selectedTile: null,
    selectedSettlement: null,
    selectedRoad: null
  });

  // Générer tous les sommets uniques (pour les settlements)
  const allVertices = new Map<string, Vertex>();
  tilesLayout.forEach(tile => {
    getHexCorners(tile.q, tile.r, HEX_SIZE).forEach(v => {
      allVertices.set(v.id, v);
    });
  });

  // Filtrer les sommets valides pour Catan (ceux partagés par au moins 1 tuile)
  // Dans un vrai jeu, on limiterait aux sommets à la périphéSrie
  const settlements: SettlementData[] = Array.from(allVertices.values())
    .map(v => ({ id: v.id, vertex: v }))
    .filter(s => {
      // Exemple: filtrer ceux trop proches du bord (à adapter selon ton layout)
      return true; // Tu peux ajouter tes propres règles ici
    });

  // Générer toutes les arêtes uniques (pour les routes)
  const allEdges = new Map<string, Edge>();
  tilesLayout.forEach(tile => {
    getHexEdges(tile.q, tile.r, HEX_SIZE).forEach(e => {
      allEdges.set(e.id, e);
    });
  });
  const roads: RoadData[] = Array.from(allEdges.values()).map(e => ({
    id: e.id,
    edge: e
  }));

  // Handlers de sélection
  const handleTileClick = (data: TileData) => {
    setSelected(prev => ({
      ...prev,
      selectedTile: prev.selectedTile?.q === data.q && prev.selectedTile?.r === data.r
        ? null
        : data,
      selectedSettlement: null,
      selectedRoad: null
    }));
  };

  const handleSettlementClick = (data: SettlementData) => {
    setSelected(prev => ({
      ...prev,
      selectedSettlement: prev.selectedSettlement?.id === data.id
        ? null
        : data,
      selectedTile: null,
      selectedRoad: null
    }));
  };

  const handleRoadClick = (data: RoadData) => {
    setSelected(prev => ({
      ...prev,
      selectedRoad: prev.selectedRoad?.id === data.id
        ? null
        : data,
      selectedTile: null,
      selectedSettlement: null
    }));
  };

  // Debug console
  console.log('Selection:', {
    tile: selected.selectedTile ? `(${selected.selectedTile.q},${selected.selectedTile.r})` : 'none',
    settlement: selected.selectedSettlement?.id || 'none',
    road: selected.selectedRoad?.id || 'none'
  });

  // Calculer les dimensions SVG nécessaires
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



  return (
    <div style={{ width: '100%', maxWidth: svgWidth, margin: '0 auto' }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`${offsetX} ${offsetY} ${svgWidth} ${svgHeight}`}
        style={{ border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}
      >
        {/* Ordre important: tuiles en fond, puis routes, puis settlements */}

        {/* TUILES */}
        {tilesLayout.map(tile => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
            isSelected={selected.selectedTile?.q === tile.q && selected.selectedTile?.r === tile.r}
            isHovered={isTileHovered(hovered, tile)}  // ✅ Typed
            onHoverChange={(isHovered) => handleTileHover(isHovered, tile)}
            onClick={handleTileClick}
          />
        ))}

        {/* ROUTES */}
        {roads.map(road => (
          <Road
            key={`road-${road.id}`}
            data={road}
            isSelected={selected.selectedRoad?.id === road.id}
            isHovered={isRoadHovered(hovered, road)}  // ✅ Typed
            onHoverChange={(isHovered) => handleRoadHover(isHovered, road)}
            onClick={handleRoadClick}
          />
        ))}

        {/* SETTLEMENTS */}
        {settlements.map(settlement => (
          <Settlement
            key={`settlement-${settlement.id}`}
            data={settlement}
            isSelected={selected.selectedSettlement?.id === settlement.id}
            isHovered={isSettlementHovered(hovered, settlement)}  // ✅ Typed
            onHoverChange={(isHovered) => handleSettlementHover(isHovered, settlement)}
            onClick={handleSettlementClick}
          />
        ))}
      </svg>

      {/* Info sélection */}
      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#eee', borderRadius: '4px' }}>
        <strong>Sélection actuelle:</strong>
        {selected.selectedTile && <div>• Tuile: ({selected.selectedTile.q}, {selected.selectedTile.r})</div>}
        {selected.selectedSettlement && <div>• Settlement: {selected.selectedSettlement.id}</div>}
        {selected.selectedRoad && <div>• Route: {selected.selectedRoad.id}</div>}
        {!selected.selectedTile && !selected.selectedSettlement && !selected.selectedRoad && <div>Aucune sélection</div>}
      </div>
    </div>
  );
}

export default GameBoard;
