import {
  type TradeRequestPayload,
  type Player
} from "@shared/game/game.types";
import {
  type GameBoardGraph
} from "@shared/game/gameboard.types"

interface TradeValidation {
  valid: boolean;
  message: string;
}

export const tradeCheck = (
  payload: TradeRequestPayload,
  player: Player,
  graph: GameBoardGraph,
): TradeValidation => {

  // Same as `buildCheck` but really usefull?
  //if ((payload.data as { id?: unknown })?.id !== payload.id) {
  //  return {
  //    valid: false,
  //    message: 'incoherent data payload id',
  //  };
  //}
  // ---------------------

  let validation: TradeValidation = { valid: false, message: 'invalid trade'};
  switch(payload.trader) {
    case 'port':
      const target = graph.get(payload.sourceId);
      if(!target) {
        console.log(`👀❌tradeCheck: ${player.playerId} unknown port`);
        validation.message = "unknown port"
      } else {
        const hasOwnAdjacentSettlement = target.connectedSettlements.some(
        (s) => s.ownerId === player.playerId,
        );
        if (!hasOwnAdjacentSettlement) {
          console.log(`👀❌tradeCheck: ${player.playerId} is not connected to port via settlement`);
          return { ...validation, message: "can't trade because it's not connected"}
        } else {
          console.log(`👀✅tradeCheck: ${player.playerId} is connected to port via settlement`);
          return { valid: true, message: "can trade because it's connected" }
        }
      }
      break;
    default:
      break;
  }
  return validation;
};
