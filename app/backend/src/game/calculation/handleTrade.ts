import {
  type TradeRequestPayload,
  type Player
} from "@shared/game/game.types";
import {
  type GameBoardGraph
} from "@shared/game/gameboard.types"
import { earnTradeResources, hasEnoughResourcesToTrade, payTradeResources } from "./handleResources";

interface TradeValidation {
  valid: boolean;
  message: string;
}

export const tradeCheck = (
  payload: TradeRequestPayload,
  player: Player,
  graph: GameBoardGraph,
): TradeValidation => {

  // Same as in `buildCheck` but really usefull?
  //if ((payload.data as { id?: unknown })?.id !== payload.id) {
  //  return {
  //    valid: false,
  //    message: 'incoherent data payload id',
  //  };
  //}
  // ---------------------

  if (payload.offer.resource === payload.target.resource) {
    console.log(`👀❌tradeCheck: ${player.playerId} can't trade ${payload.offer.resource} for ${payload.target.resource} !`);
    return { valid: false, message: `can't trade ${payload.offer.resource} for ${payload.target.resource} !`}
  }

  let validation: TradeValidation = { valid: false, message: 'unsuccessfull trade'};
  switch(payload.trader) {
    case 'port':
      const target = graph.get(payload.sourceId);
      if(!target) {
        console.log(`👀❌tradeCheck: ${player.playerId} unknown ${payload.trader}`);
        validation.message = `unknown ${payload.trader}`
      } else {
        const hasOwnConnectedSettlement = target.connectedSettlements.some(
        (s) => s.ownerId === player.playerId,
        );
        if (!hasOwnConnectedSettlement) {
          console.log(`👀❌tradeCheck: ${player.playerId} is not connected to ${payload.trader} via settlement/city`);
          return { ...validation, message: `can't trade because you are not connected to ${payload.trader} via a settlement/city`}
        } else {
          if(hasEnoughResourcesToTrade(player.resources, payload.offer)) {
            payTradeResources(player.resources, payload.offer);
            earnTradeResources(player.resources, payload.target);
            console.log(`👀✅tradeCheck: ${player.playerId} traded with ${payload.trader}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`);
            return { valid: true, message: `successfully traded with ${payload.trader}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`}
          }
          console.log(`👀❌tradeCheck: ${player.playerId} has not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`);
          return { valid: false, message: `not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`}
        }
      }
      break;
    default:
      break;
  }
  return validation;
};
