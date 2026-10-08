import { HexTile } from './HexTile'
import { Road } from './RoadTile'
import { Settlement } from './SettlementTile'
import { useGameBoardSelection } from '../../hooks/useGameBoardSelection';
import { useGameBoardHover } from '../../hooks/useGameBoardHover';
import {
    Edge,
    Vertex,
    RoadData,
    SettlementData,
    classicLayout } from '../../types/gameboard.types';
import {
    getHexCorners,
    getHexEdges,
    HEX_SIZE } from '../../utils/hexRendering'

function GameBoard() {
  const {selected,
    handleTileClick, handleSettlementClick, handleRoadClick } = useGameBoardSelection();
  const { isTileHovered, isRoadHovered, isSettlementHovered,
    handleTileHover, handleRoadHover, handleSettlementHover } = useGameBoardHover();

  // Générer tous les sommets uniques (pour les settlements)
  const allVertices = new Map<string, Vertex>();
  classicLayout.forEach(tile => {
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
  classicLayout.forEach(tile => {
    getHexEdges(tile.q, tile.r, HEX_SIZE).forEach(e => {
      allEdges.set(e.id, e);
    });
  });
  const roads: RoadData[] = Array.from(allEdges.values()).map(e => ({
    id: e.id,
    edge: e
  }));

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
        {classicLayout.map(tile => (
          <HexTile
            key={`tile-${tile.q}-${tile.r}`}
            data={tile}
            isSelected={selected.selectedTile?.q === tile.q && selected.selectedTile?.r === tile.r}
            isHovered={isTileHovered(tile)}
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
            isHovered={isRoadHovered(road)}
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
            isHovered={isSettlementHovered(settlement)}
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
