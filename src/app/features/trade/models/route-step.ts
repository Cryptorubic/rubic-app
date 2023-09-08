import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { TokenAmount } from 'rubic-sdk';

export interface RouteStep {
  type: SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING | SWAP_PROVIDER_TYPE.INSTANT_TRADE;
  provider: TradeProvider;
  path: {
    from: TokenAmount;
    to: TokenAmount;
  }[];
}
