import {
  LandType,
  Faction,
  LAND_COLORS,
  FACTION_COLORS,
  SELECTED_COLOR,
  HOVER_COLOR,
  DEFAULT_COLOR
} from '../types/gameboard.types';

/** @description render tile color based on state, land type or faction */
export const getTileFillColor = (
  landType: LandType | null,
  faction: Faction | null,
  isSelected: boolean,
  isHovered: boolean
): string => {
  if (isSelected) return SELECTED_COLOR;
  if (isHovered) return HOVER_COLOR;
  if (landType) return LAND_COLORS[landType];
  if (faction) return FACTION_COLORS[faction];
  return DEFAULT_COLOR;
};

export const getTileStrokeColor = (isHovered: boolean): string => {
  return isHovered ? '#666' : '#444';
};

export const getTileStrokeWidth = (isHovered: boolean): number => {
  return isHovered ? 3 : 2;
};
