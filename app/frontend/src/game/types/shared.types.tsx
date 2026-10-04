import { TileData, RoadData, SettlementData } from "./gameboard.types";

/**
 * Common definition for all interactive game features
 */
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
  //owner?: PlayerId;
}

export interface SettlementProps extends InteractiveProps<SettlementData> {
  hasOwner?: boolean;
  //owner?: PlayerId;
}