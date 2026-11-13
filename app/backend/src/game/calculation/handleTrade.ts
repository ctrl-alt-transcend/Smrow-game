import { type TradePayload, type Player } from 'shared';
import {
  SPECIAL_PORT_RATE,
  GENERIC_PORT_RATE,
  RESERVE_RATE,
  TraderType,
  type GameBoardGraph,
} from 'shared';
import {
  earnTradeResources,
  hasEnoughResourcesToTrade,
  payTradeResources,
} from './handleResources';

interface TradeValidation {
  valid: boolean;
  message: string;
}

const rateCheck = (
  offerAmount: number,
  targetAmount: number,
  trader: TraderType,
): boolean => {
  switch (trader) {
    case 'specialized port':
      if (offerAmount / targetAmount === SPECIAL_PORT_RATE) return true;
      break;
    case 'generic port':
      if (offerAmount / targetAmount === GENERIC_PORT_RATE) return true;
      break;
    case 'reserve':
      if (offerAmount / targetAmount === RESERVE_RATE) return true;
      break;
    default:
      break;
  }

  return false;
};

export const tradeCheck = (
  payload: TradePayload,
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
    console.log(
      `👀❌tradeCheck: ${player.playerId} can't trade ${payload.offer.resource} for ${payload.target.resource} !`,
    );
    return {
      valid: false,
      message: `can't trade ${payload.offer.resource} for ${payload.target.resource} !`,
    };
  }
  if (!rateCheck(payload.offer.amount, payload.target.amount, payload.trader)) {
    console.log(
      `👀❌tradeCheck: error in ratio, ${player.playerId} can't trade ${payload.offer.resource} for ${payload.target.resource} !`,
    );
    return {
      valid: false,
      message: `invalid ratio, can't trade ${payload.offer.resource} for ${payload.target.resource} in ${payload.trader}`,
    };
  }
  const validation: TradeValidation = {
    valid: false,
    message: 'unsuccessfull trade',
  };
  switch (payload.trader) {
    case 'generic port':
    case 'specialized port': {
      const target = graph.get(payload.sourceId);
      if (!target) {
        console.log(
          `👀❌tradeCheck: ${player.playerId} unknown ${payload.trader}`,
        );
        validation.message = `unknown ${payload.trader}`;
      } else {
        const hasOwnConnectedSettlement = target.connectedSettlements.some(
          (s) => s.ownerId === player.playerId,
        );
        if (!hasOwnConnectedSettlement) {
          console.log(
            `👀❌tradeCheck: ${player.playerId} is not connected to this ${payload.trader} via a settlement/city`,
          );
          return {
            valid: false,
            message: `can't trade because you are not connected to this port via a settlement/city`,
          };
        } else {
          if (hasEnoughResourcesToTrade(player.resources, payload.offer)) {
            payTradeResources(player.resources, payload.offer);
            earnTradeResources(player.resources, payload.target);
            console.log(
              `👀✅tradeCheck: ${player.playerId} traded with ${payload.trader}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
            );
            return {
              valid: true,
              message: `successfully traded with ${payload.trader}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
            };
          }
          console.log(
            `👀❌tradeCheck: ${player.playerId} has not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`,
          );
          return {
            valid: false,
            message: `not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`,
          };
        }
      }
      break;
    }
    case 'reserve':
      if (hasEnoughResourcesToTrade(player.resources, payload.offer)) {
        payTradeResources(player.resources, payload.offer);
        earnTradeResources(player.resources, payload.target);
        console.log(
          `👀✅tradeCheck: ${player.playerId} traded with Schnek: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
        );
        return {
          valid: true,
          message: `successfully traded with Schnek: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
        };
      }
      console.log(
        `👀❌tradeCheck: ${player.playerId} has not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with Schnek`,
      );
      return {
        valid: false,
        message: `not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with Schnek`,
      };
    default:
      break;
  }
  return validation;
};
