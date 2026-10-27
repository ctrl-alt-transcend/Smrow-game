/**
 * harvest.ts — Récolte des ressources (règles de Catan)
 * ...
 */
import type {
  GameBoardData,
  TileData,
  SettlementData,
  Vertex,
  Faction,
} from '@shared/game/gameboard.types';
import { axialToPixel, HEX_SIZE } from '@shared/game/hexCalculation';