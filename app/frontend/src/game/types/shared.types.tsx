import { TileData, RoadData, SettlementData } from "./gameboard.types";

// Définition commune pour toutes les entités interactives
export interface InteractiveProps<T> {
  data: T;
  isSelected: boolean;
  isHovered?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
  onClick: (data: T) => void;
}

export interface TileProps extends InteractiveProps<TileData> {
}

export interface RoadProps extends InteractiveProps<RoadData> {
  hasOwner?: boolean;
}

export interface SettlementProps extends InteractiveProps<SettlementData> {
  //owner?: PlayerId;
  hasOwner?: boolean;
}