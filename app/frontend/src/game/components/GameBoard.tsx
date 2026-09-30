import React, { useState } from 'react';

// ============================================
// TYPES
// ============================================

interface HexCoord {
  q: number;
  r: number;
}

interface Vertex {
  id: string;      // "{q}:{r}:{cornerIndex}"
  x: number;
  y: number;
}

interface Edge {
  id: string;              // "{vertexId1}-{vertexId2}"
  p1: Vertex;
  p2: Vertex;
}

interface TileData extends HexCoord {}

interface SettlementData {
  id: string;
  vertex: Vertex;
}

interface RoadData {
  id: string;
  edge: Edge;
}

// ============================================
// FONCTIONS DE CONVERSION
// ============================================

const HEX_SIZE = 30;

// Coordonnées axiales → pixels (pointy-topped)
const axialToPixel = (q: number, r: number, size: number) => ({
  x: size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
  y: size * (3 / 2 * r)
});

// Coordonnées axiales → sommets (6 corners par hexagone)
const getHexCorners = (q: number, r: number, size: number): Vertex[] => {
  const center = axialToPixel(q, r, size);
  const corners: Vertex[] = [];

  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // pointy-topped
    const angle_rad = (Math.PI / 180) * angle_deg;
    corners.push({
      id: `${q}:${r}:${i}`,
      x: center.x + size * Math.cos(angle_rad),
      y: center.y + size * Math.sin(angle_rad)
    });
  }

  return corners;
};

// Génère toutes les arêtes d'un hexagone (entre sommets consécutifs)
const getHexEdges = (q: number, r: number, size: number): Edge[] => {
  const corners = getHexCorners(q, r, size);
  const edges: Edge[] = [];

  for (let i = 0; i < 6; i++) {
    const nextIndex = (i + 1) % 6;
    edges.push({
      id: `${corners[i].id}-${corners[nextIndex].id}`,
      p1: corners[i],
      p2: corners[nextIndex]
    });
  }

  return edges;
};

// ============================================
// COMPOSANTS
// ============================================

interface HexTileProps {
  data: TileData;
  isSelected: boolean;
  onClick: (data: TileData) => void;
}

const HexTile: React.FC<HexTileProps> = ({ data, isSelected, onClick }) => {
  const { x: centerX, y: centerY } = axialToPixel(data.q, data.r, HEX_SIZE);
  const hexRadius = HEX_SIZE;

  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + hexRadius * Math.cos(angle_rad);
    const y = centerY + hexRadius * Math.sin(angle_rad);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={isSelected ? '#fffacd' : '#e0e0e0'}
      stroke="#444"
      strokeWidth="2"
      onClick={() => onClick(data)}
      style={{ cursor: 'pointer' }}
      data-type="tile"
      data-q={data.q}
      data-r={data.r}
    />
  );
};

interface SettlementProps {
  data: SettlementData;
  isSelected: boolean;
  hasOwner?: boolean;
  onClick: (data: SettlementData) => void;
}

const Settlement: React.FC<SettlementProps> = ({ data, isSelected, hasOwner, onClick }) => {
  return (
    <circle
      cx={data.vertex.x}
      cy={data.vertex.y}
      r={isSelected ? 8 : 6}
      fill={hasOwner ? '#ffd700' : (isSelected ? '#ffcc00' : '#cccccc')}
      stroke="#333"
      strokeWidth="1.5"
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: 'pointer' }}
      data-type="settlement"
    />
  );
};

interface RoadProps {
  data: RoadData;
  isSelected: boolean;
  hasOwner?: boolean;
  onClick: (data: RoadData) => void;
}

const Road: React.FC<RoadProps> = ({ data, isSelected, hasOwner, onClick }) => {
  return (
    <line
      x1={data.edge.p1.x}
      y1={data.edge.p1.y}
      x2={data.edge.p2.x}
      y2={data.edge.p2.y}
      stroke={hasOwner ? '#c41e3a' : (isSelected ? '#ff6b6b' : '#888888')}
      strokeWidth={isSelected ? 5 : 4}
      strokeLinecap="round"
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
      style={{ cursor: 'pointer' }}
      data-type="road"
    />
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

interface GameBoardState {
  selectedTile: TileData | null;
  selectedSettlement: SettlementData | null;
  selectedRoad: RoadData | null;
}

function GameBoard() {
  const [selected, setSelected] = useState<GameBoardState>({
    selectedTile: null,
    selectedSettlement: null,
    selectedRoad: null
  });

  // Layout Catan basique
   const tiles: TileData[] = [
    { q: 0, r: -2 }, { q: 1, r: -2 }, { q: 2, r: -2 },                                // ROW 1
    { q: -1, r: -1 }, { q: 0, r: -1 }, { q: 1, r: -1 }, { q: 2, r: -1 },              // ROW 2
    { q: -2, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, // ROW 3
    { q: -2, r: 1 },{ q: -1, r: 1 }, { q: 0, r: 1 }, { q: 1, r: 1 },                  // ROW 4
    { q: -2, r: 2 },{ q: -1, r: 2 }, { q: 0, r: 2 }                                   // ROW 5

  ];

  // Générer tous les sommets uniques (pour les settlements)
  const allVertices = new Map<string, Vertex>();
  tiles.forEach(tile => {
    getHexCorners(tile.q, tile.r, HEX_SIZE).forEach(v => {
      allVertices.set(v.id, v);
    });
  });

  // Filtrer les sommets valides pour Catan (ceux partagés par au moins 1 tuile)
  // Dans un vrai jeu, on limiterait aux sommets à la périphérie
  const settlements: SettlementData[] = Array.from(allVertices.values())
    .map(v => ({ id: v.id, vertex: v }))
    .filter(s => {
      // Exemple: filtrer ceux trop proches du bord (à adapter selon ton layout)
      return true; // Tu peux ajouter tes propres règles ici
    });

  // Générer toutes les arêtes uniques (pour les routes)
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
        {tiles.map(tile => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
            isSelected={selected.selectedTile?.q === tile.q && selected.selectedTile?.r === tile.r}
            onClick={handleTileClick}
          />
        ))}

        {/* ROUTES */}
        {roads.map(road => (
          <Road
            key={`road-${road.id}`}
            data={road}
            isSelected={selected.selectedRoad?.id === road.id}
            onClick={handleRoadClick}
          />
        ))}

        {/* SETTLEMENTS */}
        {settlements.map(settlement => (
          <Settlement
            key={`settlement-${settlement.id}`}
            data={settlement}
            isSelected={selected.selectedSettlement?.id === settlement.id}
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