import { calculateGameBoardData } from '../utils/gameBoardCalculation';
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect
} from 'react';
import {
  GameBoardData,
  RoadData,
  SettlementData,
  Faction,
  TileData
} from '../types/gameboard.types'

type GameBoardContextType = {
  gameboard: GameBoardData;
  layout: TileData[];
  updateGameboard: (newGameboard: GameBoardData) => void;
  updateRoadFaction: (road: RoadData, faction: Faction) => void;
  updateSettlementFaction: (settlement: SettlementData, faction: Faction) => void;
}

export const GameBoardContext = createContext<GameBoardContextType | null>(null);

const GameBoardProvider: React.FC<{ children: React.ReactNode; layout: TileData[] }> = ({
  children,
  layout
}) => {
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [gameboard, setGameboard] = useState<GameBoardData>(() => calculateGameBoardData(layout));

  useEffect(() => {
    setCurrentLayout(layout);
    setGameboard(calculateGameBoardData(layout));
  }, [layout]);

  const updateGameboard = useCallback((newGameboard: GameBoardData) => {
    setGameboard(newGameboard);
  }, []);

  const updateLayout = useCallback((newLayout: TileData[]) => {
    setCurrentLayout(newLayout);
    setGameboard(calculateGameBoardData(newLayout));
  }, []);

  const updateRoadFaction = useCallback((newRoad: RoadData, faction: Faction) => {
    setGameboard(prev => ({
      ...prev,
      roads: prev.roads.map(road =>
        road.id === newRoad.id ? { ...road, faction } : road
      )
    }));
  }, []);

  const updateSettlementFaction = useCallback((newSettlement: SettlementData, faction: Faction) => {
    setGameboard(prev => ({
      ...prev,
      settlements: prev.settlements.map(settlement =>
        settlement.id === newSettlement.id ? { ...settlement, faction } : settlement
      )
    }));
  }, []);

  const value = useMemo(() => ({
    gameboard,
    layout,
    updateGameboard,
    updateLayout,
    updateRoadFaction,
    updateSettlementFaction
  }), [gameboard, updateGameboard, updateRoadFaction, updateSettlementFaction]);

  return (
    <GameBoardContext.Provider value={value}>
      {children}
    </GameBoardContext.Provider>
  );
};

export const useGameBoard = () => {
  const context = useContext(GameBoardContext);
  if (!context) {
    throw new Error('useGameBoard must be used within GameBoardProvider');
  }
  return context;
};

export default GameBoardProvider;