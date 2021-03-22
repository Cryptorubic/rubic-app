import BigNumber from 'bignumber.js';
import SwapToken from '../tokens/SwapToken';

export interface TradeParameters {
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: BigNumber;
  toAmount: BigNumber;
}
