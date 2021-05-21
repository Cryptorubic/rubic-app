import SwapToken from '../../../../shared/models/tokens/SwapToken';

export interface InstantTradeParameters {
  fromAmount: string;
  fromToken: SwapToken;
  toToken: SwapToken;

  isCustomFromTokenFormOpened: boolean;
  isCustomToTokenFormOpened: boolean;
  customFromTokenAddress: string;
  customToTokenAddress: string;

  gasOptimizationChecked: boolean;
}
