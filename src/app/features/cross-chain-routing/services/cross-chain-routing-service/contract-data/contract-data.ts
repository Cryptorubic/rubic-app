import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import { ItProvider } from '@features/instant-trade/services/instant-trade-service/models/ItProvider';

interface MinimalProvider extends ItProvider {
  getFromAmount: (
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken,
    toAmount: BigNumber
  ) => Promise<BigNumber>;
}

export class CrossChainContractData {
  constructor(
    public readonly provider: MinimalProvider,
    public readonly contractNumber: number,
    private readonly isAvalanche = false
  ) {}
}
