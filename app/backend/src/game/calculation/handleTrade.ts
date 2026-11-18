import {
  type TradePayload,
  type Player,
  TraderType,
  type GameBoardGraph,
  SettingsData,
  RESERVE_NAME,
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
  settings: SettingsData,
): boolean => {
  switch (trader) {
    case TraderType.SPECIALIZED_PORT:
      if (offerAmount / targetAmount === settings.specialPortOfferRate)
        return true;
      break;
    case TraderType.GENERIC_PORT:
      if (offerAmount / targetAmount === settings.genericPortOfferRate)
        return true;
      break;
    case TraderType.RESERVE:
      if (offerAmount / targetAmount === settings.reserveOfferRate) return true;
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
  settings: SettingsData,
): TradeValidation => {
  if (payload.offer.resource === payload.target.resource) {
    return {
      valid: false,
      message: `Can't trade ${payload.offer.resource} for ${payload.target.resource} !`,
    };
  }
  if (
    !rateCheck(
      payload.offer.amount,
      payload.target.amount,
      payload.trader,
      settings,
    )
  ) {
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
    case TraderType.GENERIC_PORT:
    case TraderType.SPECIALIZED_PORT: {
      const target = graph.get(payload.sourceId);
      if (!target) {
        validation.message = `Unknown ${payload.trader}`;
      } else {
        const hasOwnConnectedSettlement = target.connectedSettlements.some(
          (s) => s.ownerId === player.username,
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
    case TraderType.RESERVE:
      if (hasEnoughResourcesToTrade(player.resources, payload.offer)) {
        payTradeResources(player.resources, payload.offer);
        earnTradeResources(player.resources, payload.target);
        return {
          valid: true,
          message: `Successfully traded with ${RESERVE_NAME}: ${payload.offer.amount}x ${payload.offer.resource} for ${payload.target.amount}x ${payload.target.resource}`,
        };
      }
      return {
        valid: false,
        message: `Not enough ${payload.offer.resource} to trade ${payload.target.amount}x ${payload.target.resource} with ${payload.trader}`,
      };
    default:
      break;
  }
  return validation;
};
