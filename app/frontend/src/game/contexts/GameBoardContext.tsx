import { calculateGameBoardData } from '../utils/gameBoardCalculation';
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
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
  updateGameboard: (newGameboard: GameBoardData) => void;
  updateRoadFaction: (road: RoadData, faction: Faction) => void;
  updateSettlementFaction: (settlement: SettlementData, faction: Faction) => void;
}

export const GameBoardContext = createContext<GameBoardContextType | null>(null);

const GameBoardProvider: React.FC<{ children: React.ReactNode; layout: TileData[] }> = ({
  children,
  layout
}) => {
  const [gameboard, setGameboard] = useState<GameBoardData>(() => calculateGameBoardData(layout));

  const updateGameboard = useCallback((newGameboard: GameBoardData) => {
    setGameboard(newGameboard);
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
    updateGameboard,
    updateRoadFaction,
    updateSettlementFaction
  }), [
    gameboard,
    updateGameboard,
    updateRoadFaction,
    updateSettlementFaction
  ]);

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