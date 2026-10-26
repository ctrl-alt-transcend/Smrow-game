import {
  type TileData,
  type RoadData,
  type SettlementData
} from "../../../../shared/game/gameboard.types";

/** @description common definition for all interactive game features */
export interface InteractiveProps<T> {
  data: T;
  isSelected: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onClick: (data: T) => void;
  hasOwner?: boolean | null;
  //owner?: PlayerId | null;
}

export interface TileProps extends InteractiveProps<TileData> { }
export interface RoadProps extends InteractiveProps<RoadData> { }
export interface SettlementProps extends InteractiveProps<SettlementData> { }

/** @description set selected interactive element */
export interface GameBoardSelection {
  selectedTile: TileData | null;
  selectedSettlement: SettlementData | null;
  selectedRoad: RoadData | null;
}

// Hover effects
export interface TileHover {
  type: "tile";
  q: number;
  r: number;
}

export interface RoadHover {
  type: "road";
  id: string;
}

export interface SettlementHover {
  type: "settlement";
  id: string;
}

export type HoverEntity = TileHover | RoadHover | SettlementHover | null;

export interface GameBoardProps {
  layout: TileData[];

  //useGameBoardSelection
  selected: GameBoardSelection;
  handleTileClick: (tile: TileData | null) => void;
  handleSettlementClick: (settlement: SettlementData | null) => void;
  handleRoadClick: (road: RoadData | null) => void;
  clearSelection: () => void;

  //useGameBoardHover
  hovered: HoverEntity;
  handleTileHover: (isHovered: boolean, tile: TileData) => void;
  handleRoadHover: (isHovered: boolean, road: RoadData) => void;
  handleSettlementHover: (
    isHovered: boolean,
    settlement: SettlementData,
  ) => void;
  isTileHovered: (tile: TileData) => boolean;
  isRoadHovered: (road: RoadData) => boolean;
  isSettlementHovered: (settlement: SettlementData) => boolean;
}
