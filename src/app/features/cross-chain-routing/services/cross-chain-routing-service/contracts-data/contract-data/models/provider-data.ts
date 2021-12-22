import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/ItProvider';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';

export interface MinimalProvider extends ItProvider {
  getFromAmount: (
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    toAmount: BigNumber
  ) => Promise<BigNumber>;
}

export interface ProviderData {
  provider: MinimalProvider;
  methodSuffix: string;
}
