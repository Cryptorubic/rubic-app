import SwapToken from '../tokens/SwapToken';

export interface TradeParameters {
  fromToken: SwapToken;
  toToken: SwapToken;
  fromAmount: string;
  toAmount: string;

  isCustomFromTokenFormOpened: boolean;
  isCustomToTokenFormOpened: boolean;
  customFromTokenAddress: string;
  customToTokenAddress: string;
}
