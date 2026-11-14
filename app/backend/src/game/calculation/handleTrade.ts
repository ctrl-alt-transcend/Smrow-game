import {
  type TradePayload,
  type Player,
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
  if (payload.offer.resource === payload.target.resource) {
    return {
      valid: false,
      message: `Can't trade ${payload.offer.resource} for ${payload.target.resource} !`,
    };
  }
  if (!rateCheck(payload.offer.amount, payload.target.amount, payload.trader)) {
    return {
      valid: false,
      message: `Invalid ratio, can't trade ${payload.offer.resource} for ${payload.target.resource} in ${payload.trader}`,
    };
  }
  const validation: TradeValidation = {
    valid: false,
    message: 'Unsuccessfull trade',
  };
  switch (payload.trader) {
    case 'generic port':
    case 'specialized port': {
      const target = graph.get(payload.sourceId);
      if (!target) {
        validation.message = `Unknown ${payload.trader}`;
      } else {
        const hasOwnConnectedSettlement = target.connectedSettlements.some(
          (s) => s.ownerId === player.playerId,
        );
        if (!hasOwnConnectedSettlement) {
          return {
            valid: false,
            message: `Can't trade because you are not connected to this port via a settlement/city`,
          };
        } else {
          if (hasEnoughResourcesToTrade(player.resources, payload.offer)) {
            payTradeResources(player.resources, payload.offer);
            earnTradeResources(player.resources, payload.target);
            return {
              valid: true,
              message: `Successfully traded with ${payload.trader}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
            };
          }
          return {
            valid: false,
            message: `Not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`,
          };
        }
      }
      break;
    }
    case 'reserve':
      if (hasEnoughResourcesToTrade(player.resources, payload.offer)) {
        payTradeResources(player.resources, payload.offer);
        earnTradeResources(player.resources, payload.target);
        return {
          valid: true,
          message: `Successfully traded with Schnek: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
        };
      }
      return {
        valid: false,
        message: `Not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with Schnek`,
      };
    default:
      break;
  }
  return validation;
};
